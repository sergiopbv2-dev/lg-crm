
// --- Strategy Chart (Quality of Pipeline) ---
let strategyChartInstance = null;
let strategyViewMode = 'month'; // month, quarter, year

function initStrategyChart() {
    const ctx = document.getElementById('strategyChart');
    if (!ctx) return;

    const context = ctx.getContext('2d');
    if (strategyChartInstance) strategyChartInstance.destroy();

    strategyChartInstance = new Chart(context, {
        type: 'bar',
        data: {
            labels: [], // Dynamic
            datasets: [
                {
                    type: 'bar',
                    label: 'Pipeline Generado ($)',
                    data: [],
                    backgroundColor: '#e9ecef',
                    barPercentage: 0.6,
                    yAxisID: 'y',
                    order: 2
                },
                {
                    type: 'line',
                    label: '% LG Spec In',
                    data: [],
                    borderColor: '#A50034',
                    backgroundColor: '#A50034',
                    borderWidth: 2,
                    pointRadius: 3,
                    yAxisID: 'y1',
                    order: 0
                },
                {
                    type: 'line',
                    label: '% Retrofit',
                    data: [],
                    borderColor: '#845ef7',
                    backgroundColor: '#845ef7',
                    borderWidth: 2,
                    pointRadius: 3,
                    yAxisID: 'y1',
                    order: 0
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

    loadStrategyData();
}

// Toggle Function
window.updateStrategyView = (mode, btn) => {
    strategyViewMode = mode;
    // Update Buttons UI
    document.querySelectorAll('.view-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    loadStrategyData();
};

async function loadStrategyData() {
    if (!strategyChartInstance) return;

    console.log("Loading Strategy Data... Mode:", strategyViewMode);
    const year = new Date().getFullYear();
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    // Safe Select (try with columns, fallback if error?)
    const run = async (safe) => {
        const cols = safe
            ? 'total_net_price, created_at, stage, distributor_id'
            : 'total_net_price, created_at, stage, distributor_id, is_spec_in, is_retrofit';

        let q = supabase.from('quotes').select(cols)
            .gte('created_at', start)
            .lte('created_at', end);

        if (!isAdmin && myDistributorId) q = q.eq('distributor_id', myDistributorId);

        const r = await q;
        if (r.error) throw r.error;
        return { data: r.data, safe };
    };

    let res;
    try {
        res = await run(false);
    } catch (e) {
        try { res = await run(true); } catch (e2) { return; }
    }

    if (!res || !res.data) return;

    // Process Data based on View Mode
    let labels = [];
    let totals = [];
    let specVals = [];
    let retroVals = [];

    if (strategyViewMode === 'month') {
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        totals = new Array(12).fill(0);
        specVals = new Array(12).fill(0);
        retroVals = new Array(12).fill(0);

        res.data.forEach(x => {
            if (['Lost', 'Delete_Pending'].includes(x.stage)) return;
            const d = new Date(x.created_at);
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

    } else if (strategyViewMode === 'quarter') {
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        totals = new Array(4).fill(0);
        specVals = new Array(4).fill(0);
        retroVals = new Array(4).fill(0);

        res.data.forEach(x => {
            if (['Lost', 'Delete_Pending'].includes(x.stage)) return;
            const d = new Date(x.created_at);
            const m = d.getMonth(); // 0-11
            const q = Math.floor(m / 3); // 0-3
            const val = parseFloat(x.total_net_price) || 0;

            totals[q] += val;
            if (!res.safe) {
                if (x.is_spec_in) specVals[q] += val;
                if (x.is_retrofit) retroVals[q] += val;
            }
        });

    } else if (strategyViewMode === 'year') {
        labels = [year.toString()];
        totals = [0];
        specVals = [0];
        retroVals = [0];

        res.data.forEach(x => {
            if (['Lost', 'Delete_Pending'].includes(x.stage)) return;
            const val = parseFloat(x.total_net_price) || 0;
            totals[0] += val;
            if (!res.safe) {
                if (x.is_spec_in) specVals[0] += val;
                if (x.is_retrofit) retroVals[0] += val;
            }
        });
    }

    const specRates = totals.map((t, i) => t > 0 ? ((specVals[i] / t) * 100).toFixed(1) : 0);
    const retroRates = totals.map((t, i) => t > 0 ? ((retroVals[i] / t) * 100).toFixed(1) : 0);

    strategyChartInstance.data.labels = labels;
    strategyChartInstance.data.datasets[0].data = totals;
    strategyChartInstance.data.datasets[1].data = specRates;
    strategyChartInstance.data.datasets[2].data = retroRates;
    strategyChartInstance.update();
}
