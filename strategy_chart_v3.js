// --- Strategy Chart (Quality of Pipeline) ---
// Mode Logic V3 - Dynamic Year, Checkboxes
let strategyChartInstance = null;
let strategyViewMode = 'month'; // month, quarter, year
let strategyYear = 2026;       // Default, will be updated by select

function initStrategyChart() {
    const ctx = document.getElementById('strategyChart');
    if (!ctx) return;

    // Init Year from DOM if exists
    const yElem = document.getElementById('strategyYearFilter');
    if (yElem) strategyYear = parseInt(yElem.value) || 2026;

    const context = ctx.getContext('2d');
    if (strategyChartInstance) strategyChartInstance.destroy();

    strategyChartInstance = new Chart(context, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], // Default
            datasets: [
                {
                    type: 'bar',
                    label: 'Pipeline Generado ($)',
                    data: new Array(12).fill(0),
                    backgroundColor: '#e9ecef',
                    barPercentage: 0.6,
                    yAxisID: 'y',
                    order: 2,
                    hidden: false
                },
                {
                    type: 'line',
                    label: '% LG Spec In',
                    data: new Array(12).fill(0),
                    borderColor: '#A50034',
                    backgroundColor: '#A50034',
                    borderWidth: 2,
                    pointRadius: 3,
                    yAxisID: 'y1',
                    order: 0,
                    hidden: false
                },
                {
                    type: 'line',
                    label: '% Retrofit',
                    data: new Array(12).fill(0),
                    borderColor: '#845ef7',
                    backgroundColor: '#845ef7',
                    borderWidth: 2,
                    pointRadius: 3,
                    yAxisID: 'y1',
                    order: 0,
                    hidden: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { display: false },
                    ticks: { callback: (val) => '$' + val.toLocaleString('en-US', { notation: 'compact' }) }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    min: 0,
                    max: 100,
                    ticks: { callback: (val) => val + '%' }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // Slight delay to ensure DOM is ready? Just call load.
    loadStrategyData();
}

// Toggle Functions
window.updateStrategyView = (mode, btn) => {
    strategyViewMode = mode;
    document.querySelectorAll('.view-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    loadStrategyData();
};

window.updateStrategyYear = (val) => {
    strategyYear = parseInt(val) || 2026;
    loadStrategyData();
};

window.toggleStrategySeries = () => {
    // Just trigger reload or update visibility?
    // Let's update visibility directly for instant feedback, then data.
    // Actually, updating data handles everything.
    loadStrategyData();
};

async function loadStrategyData() {
    if (!strategyChartInstance) return;

    console.log(`Loading Strategy Data... Mode: ${strategyViewMode}, Year: ${strategyYear}`);

    // Read Checkboxes
    const showSpecIn = document.getElementById('checkSpecIn')?.checked ?? true;
    const showRetrofit = document.getElementById('checkRetrofit')?.checked ?? true;

    const start = `${strategyYear}-01-01`;
    const end = `${strategyYear}-12-31`;

    const run = async (safe) => {
        const cols = safe
            ? 'total_net_price, created_at, stage, distributor_id'
            : 'total_net_price, created_at, stage, distributor_id, is_spec_in, is_retrofit';

        let q = supabase.from('quotes').select(cols)
            .gte('created_at', start)
            .lte('created_at', end);

        if (!isAdmin && myDistributorId) q = q.eq('distributor_id', myDistributorId);

        const result = await q;
        if (result.error) throw result.error;
        return { data: result.data, safe };
    };

    let res;
    try {
        res = await run(false);
    } catch (e) {
        try { res = await run(true); } catch (e2) { return; }
    }

    if (!res || !res.data) return;

    let labels = [];
    let totals = [];
    let specVals = [];
    let retroVals = [];

    // Logic based on View Mode
    if (strategyViewMode === 'quarter') {
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        totals = new Array(4).fill(0);
        specVals = new Array(4).fill(0);
        retroVals = new Array(4).fill(0);

        res.data.forEach(x => {
            if (['Lost', 'Delete_Pending'].includes(x.stage)) return;
            const d = new Date(x.created_at); // UTC parsed
            // Filter by year strictly just in case DB returns extra
            if (d.getFullYear() !== strategyYear) return;

            const m = d.getMonth(); // 0-11
            const q = Math.floor(m / 3);
            const val = parseFloat(x.total_net_price) || 0;

            totals[q] += val;
            if (!res.safe) {
                if (x.is_spec_in) specVals[q] += val;
                if (x.is_retrofit) retroVals[q] += val;
            }
        });
    }
    else if (strategyViewMode === 'year') {
        labels = [strategyYear.toString()];
        totals = [0];
        specVals = [0];
        retroVals = [0];

        res.data.forEach(x => {
            if (['Lost', 'Delete_Pending'].includes(x.stage)) return;
            const d = new Date(x.created_at);
            if (d.getFullYear() !== strategyYear) return;

            const val = parseFloat(x.total_net_price) || 0;
            totals[0] += val;
            if (!res.safe) {
                if (x.is_spec_in) specVals[0] += val;
                if (x.is_retrofit) retroVals[0] += val;
            }
        });
    }
    else {
        // Month
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        totals = new Array(12).fill(0);
        specVals = new Array(12).fill(0);
        retroVals = new Array(12).fill(0);

        res.data.forEach(x => {
            if (['Lost', 'Delete_Pending'].includes(x.stage)) return;
            const d = new Date(x.created_at);
            if (d.getUTCFullYear() !== strategyYear && d.getFullYear() !== strategyYear) return;
            // Using generic check to be safe with timezones

            const m = d.getMonth();
            const val = parseFloat(x.total_net_price) || 0;

            if (m >= 0 && m < 12) {
                totals[m] += val;
                if (!res.safe) {
                    if (x.is_spec_in) specVals[m] += val;
                    if (x.is_retrofit) retroVals[m] += val;
                }
            }
        });
    }

    // Calculate Rates
    const specRates = totals.map((t, i) => (t > 0 && showSpecIn) ? ((specVals[i] / t) * 100).toFixed(1) : 0);
    const retroRates = totals.map((t, i) => (t > 0 && showRetrofit) ? ((retroVals[i] / t) * 100).toFixed(1) : 0);

    // Update Chart Data
    strategyChartInstance.data.labels = labels;
    strategyChartInstance.data.datasets[0].data = totals; // Bar always shows total

    // Update Lines
    strategyChartInstance.data.datasets[1].data = specRates;
    strategyChartInstance.data.datasets[2].data = retroRates;

    // Update Visibilities
    strategyChartInstance.data.datasets[1].hidden = !showSpecIn;
    strategyChartInstance.data.datasets[2].hidden = !showRetrofit;

    strategyChartInstance.update();
}
