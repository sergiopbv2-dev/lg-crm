document.addEventListener('DOMContentLoaded', () => {

    // --- SUPABASE CONFIGURATION ---
    const supabaseUrl = 'https://efbkehhayoxceutvdekw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmYmtlaGhheW94Y2V1dHZkZWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzc0NDIsImV4cCI6MjA4NTcxMzQ0Mn0.nPpkLYX-VcUjrAp47xfaIHhUN5U-PfLbjjrdTt38_k0';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    let myDistributorId = null;
    let isAdmin = false;

    // Check authentication
    // const isLoggedIn = sessionStorage.getItem('isLoggedIn'); // Removing strict check to allow Supabase Auth to handle it
    // if (!isLoggedIn) ... 

    // Load User Profile Data
    async function initDashboard() {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            window.location.href = 'CRM/index.html'; // Redirect to Login
            return;
        }

        // Show Dashboard and Hide Loader
        const dashboard = document.getElementById('dashboard');
        const loader = document.getElementById('auth-loading');
        if (dashboard) dashboard.style.display = 'flex'; // Restore display (assuming flex or block, checking style.css next)
        if (loader) loader.style.display = 'none';

        console.log("User found:", user.id);

        console.log("User found:", user.id);

        // 1. Get Profile
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
        }

        // --- SELF-FIX FOR MAR DEL SUR USER (SILENT) ---
        if (user.email === 'ventas@mardelsur.cl') {
            const { data: mdsCompany } = await supabase.from('companies').select('id').eq('name', 'Mar del Sur').single();
            if (mdsCompany && profile.distributor_id !== mdsCompany.id) {
                console.log("Auto-fixing Mar del Sur profile mismatch...");

                // 1. Update DB silently
                await supabase.from('profiles').update({
                    distributor_id: mdsCompany.id,
                    full_name: 'Vendedor Mar del Sur'
                }).eq('id', user.id);

                // 2. Update local profile object so the rest of the function works correctly immediately
                profile.distributor_id = mdsCompany.id;
                profile.full_name = 'Vendedor Mar del Sur';
            }
        }
        // ----------------------------------------------

        // --- SHOW APPROVALS LINK FOR SPECIFIC USERS ---
        if (true) {
            const navApprovals = document.getElementById('nav-approvals');
            if (navApprovals) navApprovals.style.display = 'block';
        }
        // ----------------------------------------------

        if (profile) {
            // Update UI
            document.querySelector('.user-name').textContent = profile.full_name || 'Usuario';

            // Hardcoded Super Admin Check
            if (user.email === 'admin@lge.com') {
                isAdmin = true;
                myDistributorId = null;
                document.querySelector('.user-role').textContent = 'Administrador Global';
                // document.querySelector('.brand-tagline').textContent = "VISTA GLOBAL"; 
            } else {
                isAdmin = (profile.role === 'admin');
                myDistributorId = profile.distributor_id;
                document.querySelector('.user-role').textContent = isAdmin ? 'Administrador' : 'Ejecutivo';
            }

            if (!isAdmin && !myDistributorId) {
                // If it's the new admin, force admin status
                if (user.email === 'sergio.baezv@usach.cl') {
                    isAdmin = true;
                    // Auto-fix profile role if needed
                    if (profile.role !== 'admin') {
                        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
                        profile.role = 'admin';
                    }
                } else {
                    console.warn("User has no distributor_id!");
                    // Alert commented out to avoid blocking UX for now
                    // alert("⚠️ Error Crítico: Tu usuario no está vinculado a ninguna empresa. Contacta al administrador.");
                }
            }

            // --- SHOW PRICES LINK FOR ADMINS ---
            if (isAdmin) {
                const navPrices = document.getElementById('nav-prices');
                if (navPrices) navPrices.style.display = 'block';
            }

            // 2. Get Company Name (Only if not global admin or if admin belongs to a specific company)
            if (myDistributorId) {
                const { data: company } = await supabase
                    .from('companies')
                    .select('name')
                    .eq('id', profile.distributor_id)
                    .single();

                if (company) {
                    // document.querySelector('.brand-tagline').textContent = company.name;
                }
            }

            // 3. Load Chart Data NOW that we have the Distributor ID
            initRevenueChart();
            initRevenueChart();
            initAwardChart();
            initAwardDetailChart(); // NEW Awards Detail
            initSalesDetailChart(); // NEW Sales Detail

            const yearFilter = document.getElementById('yearFilter');
            if (yearFilter) {
                loadRevenueData(yearFilter.value);
                yearFilter.addEventListener('change', (e) => loadRevenueData(e.target.value));
            }

            const awardFilter = document.getElementById('awardYearFilter');
            if (awardFilter) {
                loadAwardData(awardFilter.value);
                awardFilter.addEventListener('change', (e) => loadAwardData(e.target.value));
            }

            loadKPIs();
            loadStrategicProductData('this_month');
            loadLists(); // NEW
        }
    }

    initDashboard();

    // Handle Logout
    const logoutLink = document.querySelector('a[href="CRM/index.html"]'); // Adjust selector if needed
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent immediate navigation

            // Clear all session data
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userConfig');

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Error signing out:", error);

            // Redirect to Login Page
            window.location.href = 'CRM/index.html';
        });
    }


    // --- Revenue Chart Logic ---
    let revenueChartInstance = null;

    function initRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');

        // Prevent double-rendering / ghosting artifacts
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        // Remove Gradient to fix artifacts
        // const gradient = ... 
        const solidColor = 'rgba(165, 0, 52, 0.2)';

        revenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Revenue',
                    data: new Array(12).fill(0),
                    borderColor: '#A50034',
                    backgroundColor: solidColor, // SOLID COLOR FIX
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#A50034',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: 'origin',
                    tension: 0 // Straight lines to absolutely prevent loops/artifacts
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        ticks: { callback: (val) => '$' + val.toLocaleString() }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // --- Award Chart Logic ---
    let awardChartInstance = null;

    function initAwardChart() {
        const ctx = document.getElementById('awardChart');
        if (!ctx) return;

        const context = ctx.getContext('2d');

        if (awardChartInstance) {
            awardChartInstance.destroy();
        }

        const solidColor = 'rgba(0, 82, 204, 0.2)'; // Blue tint for distinction

        awardChartInstance = new Chart(context, {
            type: 'line', // Can be bar if preferred, but user said "asi como tengo el delivery (which is line)"
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Awarded Amount',
                    data: new Array(12).fill(0),
                    borderColor: '#0052cc', // Blue
                    backgroundColor: solidColor,
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#0052cc',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: 'origin',
                    tension: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        ticks: { callback: (val) => '$' + val.toLocaleString() }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    async function loadAwardData(year) {
        if (!awardChartInstance) return;
        if (!myDistributorId && !isAdmin) return;

        console.log(`Loading AWARD data for year: ${year}`);

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // Query Quotes directly
        let query = supabase
            .from('quotes')
            .select('id, total_net_price, award_date, distributor_id, stage')
            .gte('award_date', startDate)
            .lte('award_date', endDate);

        if (!isAdmin) {
            query = query.eq('distributor_id', myDistributorId);
        }

        const { data: quotes, error } = await query;

        if (error) {
            console.error('Error loading award data:', error);
            return;
        }

        const monthlyTotals = new Array(12).fill(0);

        if (quotes) {
            quotes.forEach(q => {
                // Filter out Lost/Delete
                if (['Lost', 'Delete_Pending', 'Lost_Pending'].includes(q.stage)) return;

                if (q.award_date && q.total_net_price) { // Use total_net_price from quotes
                    const date = new Date(q.award_date + 'T00:00:00'); // Ensure timezone doesn't shift day
                    if (!isNaN(date.getTime())) {
                        const monthIndex = date.getMonth(); // 0-11
                        const val = parseFloat(q.total_net_price);
                        if (monthIndex >= 0 && monthIndex < 12) {
                            monthlyTotals[monthIndex] += val;
                        }
                    }
                }
            });
        }

        awardChartInstance.data.datasets[0].data = monthlyTotals;
        awardChartInstance.update();
    }

    async function loadRevenueData(year) {
        if (!revenueChartInstance) return;
        if (!myDistributorId && !isAdmin) return;

        console.log(`Loading revenue for year: ${year} / Dist: ${myDistributorId}`);

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // QUERY: Quote Items linked to Quotes of this Distributor
        let query = supabase
            .from('quote_items')
            .select('id, total_line_price, delivery_date, quote_id, quotes!inner(distributor_id, project_name, stage)')
            .gte('delivery_date', startDate)
            .lte('delivery_date', endDate);

        if (!isAdmin) {
            query = query.eq('quotes.distributor_id', myDistributorId);
        }

        const { data: items, error } = await query;

        if (error) {
            console.error('Error loading revenue:', error);
            return;
        }

        // Aggregate by Month
        const monthlyTotals = new Array(12).fill(0);

        if (items) {
            items.forEach(item => {
                // Filter out Lost/Delete
                if (['Lost', 'Delete_Pending', 'Lost_Pending'].includes(item.quotes.stage)) return;

                if (item.delivery_date && item.total_line_price) {
                    const date = new Date(item.delivery_date);
                    // Check if date is valid
                    if (!isNaN(date.getTime())) {
                        const monthIndex = date.getUTCMonth(); // 0-11
                        const val = parseFloat(item.total_line_price);

                        if (monthIndex >= 0 && monthIndex < 12) {
                            monthlyTotals[monthIndex] += val;
                        }
                    }
                }
            });
        }


        // Update Chart
        revenueChartInstance.data.datasets[0].data = monthlyTotals;
        revenueChartInstance.update();

        // KPI Update moved to loadKPIs to be independent of Year Filter (User Request: "Total Pipeline")
    }

    // Expose delete function
    window.deleteQuote = async (id) => {
        if (!confirm("¿Estás seguro de ELIMINAR esta cotización completa? Esta acción no se puede deshacer.")) return;

        // 1. Delete Items first
        const { error: itemsError } = await supabase.from('quote_items').delete().eq('quote_id', id);

        if (itemsError) {
            console.error("Error deleting items:", itemsError);
            alert("Error al eliminar los ítems de la cotización: " + itemsError.message);
            return; // Stop here if items couldn't be deleted
        }

        // 2. Delete Quote
        const { error: quoteError } = await supabase.from('quotes').delete().eq('id', id);

        if (quoteError) {
            console.error("Error deleting quote:", quoteError);
            alert("Error al eliminar la cotización principal: " + quoteError.message);
        } else {
            alert("Cotización borrada correctamente.");
            // Reload Chart and Table
            const yearFilter = document.getElementById('yearFilter');
            if (yearFilter) loadRevenueData(yearFilter.value);
        }
    };

    // --- Strategy Chart (Quality of Pipeline) ---
    // Mode Logic V3 - Dynamic Year, Checkboxes
    let strategyChartInstance = null;
    // --- PIPELINE DETAILED CHARTS (Awards & Sales) ---
    let awardDetailViewMode = 'month';
    let awardDetailYear = 2026;
    let awardDetailChartInstance = null;

    let salesDetailViewMode = 'month';
    let salesDetailYear = 2026;
    let salesDetailChartInstance = null;

    // --- AWARD DETAIL CHART ---
    function initAwardDetailChart() {
        const ctx = document.getElementById('awardDetailChart');
        if (!ctx) return;
        const yElem = document.getElementById('awardDetailYearFilter');
        if (yElem) awardDetailYear = parseInt(yElem.value) || 2026;
        if (awardDetailChartInstance) awardDetailChartInstance.destroy();
        awardDetailChartInstance = createDetailChartConfig(ctx, 'Pipeline Generado (Awards)');
        loadAwardDetailData();
    }

    // --- SALES DETAIL CHART ---
    function initSalesDetailChart() {
        const ctx = document.getElementById('salesDetailChart');
        if (!ctx) return;
        const yElem = document.getElementById('salesDetailYearFilter');
        if (yElem) salesDetailYear = parseInt(yElem.value) || 2026;
        if (salesDetailChartInstance) salesDetailChartInstance.destroy();
        salesDetailChartInstance = createDetailChartConfig(ctx, 'Facturación (Sales)');
        loadSalesDetailData();
    }

    // Shared Chart Config Factory (Stacked Bars)
    function createDetailChartConfig(ctx, barLabel) {
        return new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    { label: 'Spec In', data: [], backgroundColor: '#A50034', stack: 'Stack 0', order: 1 },
                    { label: 'Retrofit', data: [], backgroundColor: '#845ef7', stack: 'Stack 0', order: 2 },
                    { label: 'Others', data: [], backgroundColor: '#e9ecef', stack: 'Stack 0', order: 3 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        mode: 'index', intersect: false,
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                    const val = context.parsed.y;
                                    // Calculate Total for this index
                                    let total = 0;
                                    context.chart.data.datasets.forEach(ds => {
                                        if (!ds.hidden) {
                                            total += (ds.data[context.dataIndex] || 0);
                                        }
                                    });
                                    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
                                    label += '$' + val.toLocaleString('en-US', { notation: 'compact' }) + ` (${pct}%)`;
                                }
                                return label;
                            },
                            footer: function (tooltipItems) {
                                let total = 0;
                                tooltipItems.forEach(function (tooltipItem) {
                                    total += tooltipItem.parsed.y;
                                });
                                return 'TTL: $' + total.toLocaleString('en-US', { notation: 'compact' });
                            }
                        },
                        footerFont: { weight: 'bold' } // Make footer bold
                    }
                },
                scales: {
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: { display: true, borderDash: [5, 5] },
                        ticks: { callback: (val) => '$' + val.toLocaleString('en-US', { notation: 'compact' }) }
                    },
                    x: { stacked: true, grid: { display: false } }
                }
            }
        });
    }

    // --- TOGGLE HANDLERS ---
    window.updateAwardDetailView = (mode, btn) => {
        awardDetailViewMode = mode;
        const parent = btn.closest('.view-toggles');
        if (parent) parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadAwardDetailData();
    };
    window.updateAwardDetailYear = (val) => { awardDetailYear = parseInt(val) || 2026; loadAwardDetailData(); };
    window.toggleAwardDetailSeries = () => { loadAwardDetailData(); };

    window.updateSalesDetailView = (mode, btn) => {
        salesDetailViewMode = mode;
        const parent = btn.closest('.view-toggles');
        if (parent) parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadSalesDetailData();
    };
    window.updateSalesDetailYear = (val) => { salesDetailYear = parseInt(val) || 2026; loadSalesDetailData(); };
    window.toggleSalesDetailSeries = () => { loadSalesDetailData(); };

    // --- DATA LOADING ---

    async function loadAwardDetailData() {
        if (!awardDetailChartInstance) return;
        const showSpec = document.getElementById('checkSpecInAward')?.checked ?? true;
        const showRetro = document.getElementById('checkRetrofitAward')?.checked ?? true;
        const start = `${awardDetailYear}-01-01`; const end = `${awardDetailYear}-12-31`;

        const run = async (safe) => {
            const cols = safe ? 'total_net_price, award_date, stage, distributor_id'
                : 'total_net_price, award_date, stage, distributor_id, is_spec_in, is_retrofit';
            let q = supabase.from('quotes').select(cols)
                .gte('award_date', start).lte('award_date', end)
                .not('stage', 'ilike', '%Lost%')
                .not('stage', 'ilike', '%elet%') // Delete / Deleted
                .not('stage', 'ilike', '%ancel%'); // Cancel / Cancelled
            if (!isAdmin) q = q.eq('distributor_id', myDistributorId);
            const result = await q;
            if (result.error) throw result.error;
            return { data: result.data.map(x => ({ ...x, date_field: x.award_date })), safe };
        };

        let res;
        try { res = await run(false); } catch (e) { try { res = await run(true); } catch (e2) { return; } }
        updateDetailChartData(awardDetailChartInstance, res, awardDetailViewMode, awardDetailYear, showSpec, showRetro);
    }

    async function loadSalesDetailData() {
        if (!salesDetailChartInstance) return;
        const showSpec = document.getElementById('checkSpecInSales')?.checked ?? true;
        const showRetro = document.getElementById('checkRetrofitSales')?.checked ?? true;
        const start = `${salesDetailYear}-01-01`; const end = `${salesDetailYear}-12-31`;

        const run = async (safe) => {
            const cols = safe ? 'total_line_price, delivery_date, quotes!inner(stage, distributor_id)'
                : 'total_line_price, delivery_date, quotes!inner(stage, distributor_id, is_spec_in, is_retrofit)';
            let q = supabase.from('quote_items').select(cols)
                .gte('delivery_date', start).lte('delivery_date', end)
                .not('quotes.stage', 'ilike', '%Lost%')
                .not('quotes.stage', 'ilike', '%elet%')
                .not('quotes.stage', 'ilike', '%ancel%');
            if (!isAdmin) q = q.eq('quotes.distributor_id', myDistributorId);
            const result = await q;
            if (result.error) throw result.error;

            // Map flattened structure
            const flat = result.data.map(i => ({
                total_net_price: i.total_line_price,
                date_field: i.delivery_date,
                stage: i.quotes.stage,
                is_spec_in: safe ? false : i.quotes.is_spec_in,
                is_retrofit: safe ? false : i.quotes.is_retrofit
            }));
            return { data: flat, safe };
        };

        let res;
        try { res = await run(false); } catch (e) { try { res = await run(true); } catch (e2) { return; } }
        updateDetailChartData(salesDetailChartInstance, res, salesDetailViewMode, salesDetailYear, showSpec, showRetro);
    }

    function updateDetailChartData(chart, res, viewMode, year, showSpec, showRetro) {
        if (!res || !res.data) return;

        let labels = [];
        let buckets = viewMode === 'quarter' ? 4 : (viewMode === 'year' ? 1 : 12);

        if (viewMode === 'quarter') labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        else if (viewMode === 'year') labels = [year.toString()];
        else labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        // Init Arrays
        let specData = new Array(buckets).fill(0);
        let retroData = new Array(buckets).fill(0);
        let otherData = new Array(buckets).fill(0);

        res.data.forEach(x => {
            if (!x.stage) return;
            const outputStage = x.stage.toString().trim().toLowerCase();
            if (outputStage.includes('lost') || outputStage.includes('delete') || outputStage.includes('cancel')) return;

            if (!x.date_field) return;

            const d = new Date(x.date_field);
            // Timezone safe year check
            if (d.getUTCFullYear() !== year && d.getFullYear() !== year) return;

            const m = d.getMonth();
            let idx = (viewMode === 'quarter') ? Math.floor(m / 3) : (viewMode === 'year' ? 0 : m);

            if (idx >= 0 && idx < buckets) {
                const val = parseFloat(x.total_net_price) || 0;

                // Allocation Logic
                if (!res.safe) {
                    if (x.is_spec_in) {
                        specData[idx] += val;
                    } else if (x.is_retrofit) {
                        retroData[idx] += val;
                    } else {
                        otherData[idx] += val;
                    }
                    // Note: If both true, this logic prioritizes Spec In. 
                    // To handle both, we'd need to know proportions. 
                    // For now, simple priority or assume disjoint.
                } else {
                    otherData[idx] += val;
                }
            }
        });

        chart.data.labels = labels;
        // Dataset 0: Spec In
        chart.data.datasets[0].data = specData;
        chart.data.datasets[0].hidden = !showSpec;

        // Dataset 1: Retrofit
        chart.data.datasets[1].data = retroData;
        chart.data.datasets[1].hidden = !showRetro;

        // Dataset 2: Other
        chart.data.datasets[2].data = otherData;
        // Logic: if both Spec and Retro are hidden, show Others? 
        // Or always show Others? Usually yes.

        chart.update();
    }

    // --- STRATEGIC PRODUCT CARD LOGIC ---
    async function loadStrategicProductData(range) {
        if (!range) range = 'this_month';
        console.log("Loading Strategic Product Data for:", range);

        const now = new Date();
        let start, end;

        // Calculate Date Range
        if (range === 'this_month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        } else if (range === 'last_month') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (range === 'this_quarter') {
            const q = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), q * 3, 1);
            end = new Date(now.getFullYear(), (q + 1) * 3, 1);
        } else if (range === 'this_year') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear() + 1, 0, 1);
        } else if (range === 'next_year') {
            start = new Date(now.getFullYear() + 1, 0, 1);
            end = new Date(now.getFullYear() + 2, 0, 1);
        } else if (range === 'last_year') {
            start = new Date(now.getFullYear() - 1, 0, 1);
            end = new Date(now.getFullYear(), 0, 1);
        }

        const startStr = start.toISOString();
        const endStr = end.toISOString();

        // Helper: Fetch & Calculate Mix
        const calcMix = async (type) => {
            // type: 'sales' or 'awards'
            let total = 0, spec = 0, retro = 0;
            let safe = false;

            const run = async (isSafe) => {
                let q;
                if (type === 'sales') {
                    // Sales (Deliveries) -> quote_items
                    const cols = isSafe
                        ? 'total_line_price, quotes!inner(stage, distributor_id)'
                        : 'total_line_price, quotes!inner(stage, distributor_id, is_spec_in, is_retrofit)';
                    q = supabase.from('quote_items').select(cols)
                        .gte('delivery_date', startStr).lt('delivery_date', endStr);
                    if (!isAdmin) q = q.eq('quotes.distributor_id', myDistributorId);
                } else {
                    // Awards -> quotes
                    const cols = isSafe
                        ? 'total_net_price, stage, distributor_id'
                        : 'total_net_price, stage, distributor_id, is_spec_in, is_retrofit';
                    q = supabase.from('quotes').select(cols)
                        .gte('award_date', startStr).lt('award_date', endStr);
                    if (!isAdmin) q = q.eq('distributor_id', myDistributorId);
                }
                const res = await q;
                if (res.error) throw res.error;
                return { data: res.data, safe: isSafe };
            };

            try {
                let res = await run(false); // Try unsafe logic first
                return res;
            } catch (e) {
                try { return await run(true); } catch (e2) { return null; }
            }
        };

        // Execute Both
        const [salesRes, awardsRes] = await Promise.all([calcMix('sales'), calcMix('awards')]);

        // Helper: Render Update
        const updateUI = (prefix, res, typeKey) => {
            // prefix: 'mix-sales' or 'mix-award'
            // typeKey: 'total_line_price' (sales) or 'total_net_price' (awards)

            // Safe Text Helper
            const safeText = (id, txt) => {
                const el = document.getElementById(id);
                if (el) el.textContent = txt;
            };

            if (!res || !res.data) {
                safeText(`${prefix}-spec-val`, '$0');
                safeText(`${prefix}-retro-val`, '$0');
                safeText(`${prefix}-spec-rate`, '(0.0%)');
                safeText(`${prefix}-retro-rate`, '(0.0%)');
                return;
            }

            let total = 0, spec = 0, retro = 0;
            // Filter invalid stages
            // For Sales: x.quotes.stage. For Awards: x.stage.
            // Need to handle determining which object has stage
            const items = res.data;

            items.forEach(x => {
                const stageRaw = x.quotes ? x.quotes.stage : x.stage;
                if (!stageRaw) return;
                const stage = stageRaw.toString().trim().toLowerCase();
                // Aggressive Blocklist
                if (stage.includes('lost') || stage.includes('delete') || stage.includes('cancel')) return;

                const val = parseFloat(x[typeKey]) || 0;
                total += val;

                if (!res.safe) {
                    const isSpec = x.quotes ? x.quotes.is_spec_in : x.is_spec_in;
                    const isRetro = x.quotes ? x.quotes.is_retrofit : x.is_retrofit;
                    if (isSpec) spec += val;
                    if (isRetro) retro += val;
                }
            });

            // Format Values
            safeText(`${prefix}-spec-val`, '$' + spec.toLocaleString('en-US', { notation: 'compact' }));
            safeText(`${prefix}-retro-val`, '$' + retro.toLocaleString('en-US', { notation: 'compact' }));

            // Format Rates (1 decimal)
            const sRate = total > 0 ? ((spec / total) * 100).toFixed(1) : '0.0';
            const rRate = total > 0 ? ((retro / total) * 100).toFixed(1) : '0.0';
            safeText(`${prefix}-spec-rate`, `(${sRate}%)`);
            safeText(`${prefix}-retro-rate`, `(${rRate}%)`);
        };

        updateUI('mix-sales', salesRes, 'total_line_price');
        updateUI('mix-award', awardsRes, 'total_net_price');
    }

    window.loadStrategicProductData = loadStrategicProductData;

    async function loadKPIs() {
        console.log("--- START Load KPIs ---");
        console.log("Distributor:", myDistributorId, "Admin:", isAdmin);

        let activeDealsCount = 0; // Added tracker

        // Helper: Safe DOM Update
        const safeText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        // 1. ACTIVE DEALS
        try {
            let q = supabase.from('quotes').select('stage');
            if (!isAdmin) q = q.eq('distributor_id', myDistributorId);
            const { data, error } = await q;
            if (error) console.error("Deals error:", error);
            if (data) {
                const count = data.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.stage)).length;
                activeDealsCount = count; // Capture
                safeText('kpi-active-deals', count);
            }
        } catch (e) { console.warn("Deals fatal:", e); }

        // 2. TOTAL PIPELINE & STRATEGIC MIX & AVG TICKET
        try {
            const run = async (safe) => {
                const cols = safe ? 'total_net_price, stage' : 'total_net_price, stage, is_spec_in, is_retrofit';
                let q = supabase.from('quotes').select(cols);
                if (!isAdmin) q = q.eq('distributor_id', myDistributorId);
                const result = await q;
                if (result.error) throw result.error;
                return { data: result.data, safe };
            };

            let res;
            try { res = await run(false); } catch (e) {
                console.warn("Pipeline: Retrying safe mode...", e);
                try { res = await run(true); } catch (e2) {
                    safeText('kpi-active-pipeline', '$0');
                }
            }

            if (res && res.data) {
                const valid = res.data.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.stage));
                let total = 0, spec = 0, retro = 0;

                valid.forEach(x => {
                    const val = parseFloat(x.total_net_price) || 0;
                    total += val;
                    if (!res.safe) {
                        if (x.is_spec_in) spec += val;
                        if (x.is_retrofit) retro += val;
                    }
                });

                safeText('kpi-active-pipeline', '$' + total.toLocaleString('en-US', { maximumFractionDigits: 0 }));

                // Populate Strategic Mix Card
                if (res.safe) {
                    safeText('kpi-spec-total', 'N/A');
                    safeText('kpi-retro-total', 'N/A');
                    safeText('kpi-spec-rate', '(0%)');
                    safeText('kpi-retro-rate', '(0%)');
                } else {
                    // Use compact notation for amounts in the small card
                    safeText('kpi-spec-total', '$' + spec.toLocaleString('en-US', { notation: 'compact' }));
                    safeText('kpi-retro-total', '$' + retro.toLocaleString('en-US', { notation: 'compact' }));

                    const sRate = total > 0 ? ((spec / total) * 100).toFixed(1) : '0.0';
                    const rRate = total > 0 ? ((retro / total) * 100).toFixed(1) : '0.0';
                    safeText('kpi-spec-rate', `(${sRate}%)`);
                    safeText('kpi-retro-rate', `(${rRate}%)`);
                }

                // Calculate Avg Ticket Size
                // Depends on activeDealsCount from Block 1 being available in closure scope
                const avg = activeDealsCount > 0 ? (total / activeDealsCount) : 0;
                safeText('kpi-avg-ticket', '$' + avg.toLocaleString('en-US', { maximumFractionDigits: 0 }));
            }
        } catch (e) { console.warn("Pipeline fatal:", e); }

        // 3. MONTH DELIVERIES (SALES)
        try {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

            const run = async (safe) => {
                const cols = safe
                    ? 'total_line_price, quotes!inner(stage, distributor_id)'
                    : 'total_line_price, quotes!inner(stage, distributor_id, is_spec_in, is_retrofit)';

                let q = supabase.from('quote_items').select(cols).gte('delivery_date', start).lt('delivery_date', end);
                if (!isAdmin) q = q.eq('quotes.distributor_id', myDistributorId);
                const result = await q;
                if (result.error) throw result.error;
                return { data: result.data, safe };
            };

            let res;
            try { res = await run(false); } catch (e) {
                console.warn("Deliveries: Retrying safe mode...", e);
                try { res = await run(true); } catch (e2) {
                    safeText('kpi-deliveries-month', '$0');
                    safeText('kpi-del-breakdown', '-');
                }
            }

            if (res && res.data) {
                let total = 0, spec = 0, retro = 0;
                const valid = res.data.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.quotes.stage));

                valid.forEach(x => {
                    const val = parseFloat(x.total_line_price) || 0;
                    total += val;
                    if (!res.safe) {
                        if (x.quotes.is_spec_in) spec += val;
                        if (x.quotes.is_retrofit) retro += val;
                    }
                });

                safeText('kpi-deliveries-month', '$' + total.toLocaleString('en-US', { maximumFractionDigits: 0 }));

                // Strategic Mix Card (Sales Side)
                if (res.safe) {
                    safeText('kpi-del-breakdown', 'Spec: N/A | Retro: N/A');
                } else {
                    const sP = total > 0 ? Math.round((spec / total) * 100) : 0;
                    const rP = total > 0 ? Math.round((retro / total) * 100) : 0;
                    safeText('kpi-del-breakdown', `Spec In: ${sP}% | Retrofit: ${rP}%`);
                }
            }
        } catch (e) { console.error("Deliveries fatal:", e); }

        // 4. MONTH AWARDS
        try {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

            const run = async (safe) => {
                const cols = safe
                    ? 'total_net_price, stage, distributor_id'
                    : 'total_net_price, stage, distributor_id, is_spec_in, is_retrofit';
                let q = supabase.from('quotes').select(cols).gte('award_date', start).lt('award_date', end);
                if (!isAdmin) q = q.eq('distributor_id', myDistributorId);
                const result = await q;
                if (result.error) throw result.error;
                return { data: result.data, safe };
            };

            let res;
            try { res = await run(false); } catch (e) {
                console.warn("Awards: Retrying safe mode...", e);
                try { res = await run(true); } catch (e2) {
                    safeText('kpi-awards-month', '$0');
                    safeText('kpi-awd-breakdown', '-');
                }
            }

            if (res && res.data) {
                let total = 0, spec = 0, retro = 0;
                const valid = res.data.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.stage));

                valid.forEach(x => {
                    const val = parseFloat(x.total_net_price) || 0;
                    total += val;
                    if (!res.safe) {
                        if (x.is_spec_in) spec += val;
                        if (x.is_retrofit) retro += val;
                    }
                });

                safeText('kpi-awards-month', '$' + total.toLocaleString('en-US', { maximumFractionDigits: 0 }));

                // Strategic Mix Card (Awards Side)
                if (res.safe) {
                    safeText('kpi-awd-breakdown', 'Spec: N/A | Retro: N/A');
                } else {
                    const sP = total > 0 ? Math.round((spec / total) * 100) : 0;
                    const rP = total > 0 ? Math.round((retro / total) * 100) : 0;
                    safeText('kpi-awd-breakdown', `Spec In: ${sP}% | Retrofit: ${rP}%`);
                }
            }
        } catch (e) { console.error("Awards fatal:", e); }

        // 5. OTHER KPIS
        try {
            let q = supabase.from('clients').select('id', { count: 'exact', head: true });
            if (!isAdmin) q = q.eq('distributor_id', myDistributorId);
            const { count } = await q;
            safeText('kpi-total-customers', count || 0);
        } catch (e) { }

        try {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
            let q = supabase.from('quotes').select('stage').gte('created_at', start).lt('created_at', end);
            if (!isAdmin) q = q.eq('distributor_id', myDistributorId);
            const { data } = await q;
            if (data) {
                const count = data.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.stage)).length;
                safeText('kpi-quotes-month', count);
            }
        } catch (e) { }
    }

    // --- LISTS LOGIC ---
    async function loadLists() {
        if (!isAdmin && !myDistributorId) return;

        const today = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(today.getMonth() + 3);

        const startStr = today.toISOString().split('T')[0];
        const endStr = threeMonthsLater.toISOString().split('T')[0];

        // 1. Load Upcoming Deliveries
        let dQuery = supabase
            .from('quote_items')
            .select(`
                id, total_line_price, delivery_date, 
                quotes!inner(id, project_name, distributor_id, stage, companies(name))
            `)
            .gte('delivery_date', startStr)
            .lte('delivery_date', endStr)
            // Removed .not()
            .order('delivery_date', { ascending: true })
            .limit(20); // Limit higher to allow filtering

        if (!isAdmin) {
            dQuery = dQuery.eq('quotes.distributor_id', myDistributorId);
        }

        const { data: rawDItems, error: dErr } = await dQuery;

        // JS Filter
        const dItems = rawDItems ? rawDItems.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.quotes.stage)) : [];

        const dContainer = document.getElementById('deliveryList');
        if (dContainer) {
            if (dErr) {
                console.error(dErr);
                dContainer.innerHTML = '<div class="empty-state">Error cargando datos.</div>';
            } else if (!dItems || dItems.length === 0) {
                dContainer.innerHTML = '<div class="empty-state">No hay entregas próximas.</div>';
            } else {
                // Group By Month
                const grouped = {};
                dItems.forEach(item => {
                    const d = new Date(item.delivery_date);
                    // Use a sortable key for order, but display name for UI
                    const key = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                    if (!grouped[key]) grouped[key] = { items: [], total: 0 };
                    grouped[key].items.push(item);
                    grouped[key].total += parseFloat(item.total_line_price || 0);
                });

                let html = '<div class="grouped-list">';
                Object.keys(grouped).forEach(month => {
                    const group = grouped[month];
                    const groupTotal = '$' + group.total.toLocaleString('en-US', { maximumFractionDigits: 0 });

                    html += `
                        <div class="month-group">
                            <div class="month-header">
                                <span class="month-name">${month.toUpperCase()}</span>
                                <span class="month-total">${groupTotal}</span>
                            </div>
                            <ul class="data-list">
                    `;

                    group.items.forEach(item => {
                        const date = new Date(item.delivery_date).toLocaleDateString('es-ES', { day: '2-digit' });
                        const amount = '$' + parseFloat(item.total_line_price).toLocaleString('en-US', { maximumFractionDigits: 0 });
                        const project = item.quotes.project_name || 'Sin Nombre';

                        let distBadge = '';
                        if (isAdmin && item.quotes.companies) {
                            distBadge = `<span style="font-size:0.75rem; color:#666; background:#f1f3f5; padding:2px 6px; border-radius:4px; margin-left:8px; display:inline-block;">${item.quotes.companies.name}</span>`;
                        }

                        html += `
                            <li class="list-item compact">
                                <div class="list-date-small">${date}</div>
                                <div class="list-info">
                                    <span class="list-project">${project}${distBadge}</span>
                                    <span class="list-amount">${amount}</span>
                                </div>
                            </li>
                        `;
                    });
                    html += '</ul></div>';
                });
                html += '</div>';
                dContainer.innerHTML = html;
            }
        }

        // 2. Load Upcoming Awards
        let aQuery = supabase
            .from('quotes')
            .select('id, project_name, total_net_price, award_date, distributor_id, stage, companies(name)')
            .gte('award_date', startStr)
            .lte('award_date', endStr)
            // Removed .not
            .order('award_date', { ascending: true })
            .limit(20);

        if (!isAdmin) {
            aQuery = aQuery.eq('distributor_id', myDistributorId);
        }

        const { data: rawAItems, error: aErr } = await aQuery;

        // JS Filter
        const aItems = rawAItems ? rawAItems.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.stage)) : [];

        const aContainer = document.getElementById('awardList');
        if (aContainer) {
            if (aErr) {
                console.error(aErr);
                aContainer.innerHTML = '<div class="empty-state">Error cargando datos.</div>';
            } else if (!aItems || aItems.length === 0) {
                aContainer.innerHTML = '<div class="empty-state">No hay awards próximos.</div>';
            } else {
                // Group By Month (Awards)
                const grouped = {};
                aItems.forEach(item => {
                    const d = new Date(item.award_date + 'T00:00:00');
                    const key = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                    if (!grouped[key]) grouped[key] = { items: [], total: 0 };
                    grouped[key].items.push(item);
                    grouped[key].total += parseFloat(item.total_net_price || 0);
                });

                let html = '<div class="grouped-list">';
                Object.keys(grouped).forEach(month => {
                    const group = grouped[month];
                    const groupTotal = '$' + group.total.toLocaleString('en-US', { maximumFractionDigits: 0 });

                    html += `
                        <div class="month-group">
                            <div class="month-header" style="background:#e7f5ff; border-left: 4px solid #0052cc;">
                                <span class="month-name" style="color:#004085;">${month.toUpperCase()}</span>
                                <span class="month-total" style="color:#0052cc;">${groupTotal}</span>
                            </div>
                            <ul class="data-list">
                    `;

                    group.items.forEach(item => {
                        const dateObj = new Date(item.award_date + 'T00:00:00');
                        const date = dateObj.toLocaleDateString('es-ES', { day: '2-digit' });
                        const amount = '$' + parseFloat(item.total_net_price).toLocaleString('en-US', { maximumFractionDigits: 0 });
                        const project = item.project_name || 'Sin Nombre';

                        let distBadge = '';
                        if (isAdmin && item.companies) {
                            distBadge = `<span style="font-size:0.75rem; color:#004085; background:#e0f2fe; padding:2px 6px; border-radius:4px; margin-left:8px; display:inline-block;">${item.companies.name}</span>`;
                        }

                        html += `
                            <li class="list-item compact">
                                <div class="list-date-small" style="background:#e7f5ff; color:#0052cc;">${date}</div>
                                <div class="list-info">
                                    <span class="list-project">${project}${distBadge}</span>
                                    <span class="list-amount" style="color:#0052cc;">${amount}</span>
                                </div>
                            </li>
                        `;
                    });
                    html += '</ul></div>';
                });
                html += '</div>';
                aContainer.innerHTML = html;
            }
        }
    }
});
