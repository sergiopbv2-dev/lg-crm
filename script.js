document.addEventListener('DOMContentLoaded', () => {

    // --- SUPABASE CONFIGURATION ---
    const supabaseUrl = 'https://efbkehhayoxceutvdekw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmYmtlaGhheW94Y2V1dHZkZWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzc0NDIsImV4cCI6MjA4NTcxMzQ0Mn0.nPpkLYX-VcUjrAp47xfaIHhUN5U-PfLbjjrdTt38_k0';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Check authentication
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'CRM/index.html';
        return;
    }

    // Load User Profile Data
    async function loadUserProfile() {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            console.log("User found:", user.id); // Debug

            // 1. Get Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
                return;
            }

            if (profile) {
                // Update Name immediately
                console.log("Profile loaded:", profile);
                document.querySelector('.user-name').textContent = profile.full_name || 'Usuario';
                document.querySelector('.user-role').textContent = profile.role === 'admin' ? 'Administrador' : 'Ejecutivo';

                // 2. Get Company Name (Separate call to avoid Join issues)
                if (profile.company_id) {
                    const { data: company } = await supabase
                        .from('companies')
                        .select('name')
                        .eq('id', profile.company_id)
                        .single();

                    if (company) {
                        document.querySelector('.brand-tagline').textContent = company.name;
                    }
                }
            }
        } else {
            console.log("No active user found in Supabase Auth");
        }
    }
    loadUserProfile();

    // Handle Logout

    // Handle Logout
    const logoutLink = document.querySelector('a[href="CRM/index.html"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
        });
    }

    // --- Revenue Chart Logic ---
    let revenueChartInstance = null;

    function initRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(165, 0, 52, 0.2)');
        gradient.addColorStop(1, 'rgba(165, 0, 52, 0)');

        revenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Revenue',
                    data: new Array(12).fill(0), // Start with 0s
                    borderColor: '#A50034',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#A50034',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: (val) => '$' + val }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    async function loadRevenueData(year) {
        if (!revenueChartInstance) return;

        console.log(`Loading data for year: ${year}`);

        // 1. Fetch Opportunities for selected year
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data: opportunities, error } = await supabase
            .from('opportunities')
            .select('amount, closing_date')
            .gte('closing_date', startDate)
            .lte('closing_date', endDate);

        if (error) {
            console.error('Error loading chart data:', error);
            return;
        }

        // 2. Process Data (Sum by Month)
        const monthlyTotals = new Array(12).fill(0);

        opportunities.forEach(opp => {
            if (opp.closing_date && opp.amount) {
                const date = new Date(opp.closing_date);
                // Fix timezone issue by treating date as UTC component
                const monthIndex = date.getUTCMonth();
                monthlyTotals[monthIndex] += parseFloat(opp.amount);
            }
        });

        // 3. Update Chart
        revenueChartInstance.data.datasets[0].data = monthlyTotals;
        revenueChartInstance.update();

        // Update Total Sales KPI dynamically based on year
        const totalYearSales = monthlyTotals.reduce((a, b) => a + b, 0);
        document.querySelector('.kpi-main-value').textContent = '$' + totalYearSales.toLocaleString();
    }

    // Initialize Chart
    initRevenueChart();

    // Load initial data for current year
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
        loadRevenueData(yearFilter.value);

        yearFilter.addEventListener('change', (e) => {
            loadRevenueData(e.target.value);
        });
    }
});
