
// --- Strategy Chart (Quality of Pipeline) ---
let strategyChartInstance = null;

function initStrategyChart() {
    const ctx = document.getElementById('strategyChart');
    if (!ctx) return;

    const context = ctx.getContext('2d');
    if (strategyChartInstance) strategyChartInstance.destroy();

    strategyChartInstance = new Chart(context, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    label: 'Pipeline Generado ($)',
                    data: new Array(12).fill(0),
                    backgroundColor: '#e9ecef',
                    barPercentage: 0.6,
                    yAxisID: 'y',
                    order: 2
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
                    order: 0
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

async function loadStrategyData() {
    if (!strategyChartInstance) return;
    // Check if distributor set or admin
    // Note: myDistributorId might be null if admin, logic handles it

    console.log("Loading Strategy Data...");
    const year = new Date().getFullYear();
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    // Safe Select (try with columns, fallback if error?)
    // Since we fixed DB, we assume columns exist. If not, chart stays empty but NO CRASH.

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
        console.warn("Strategy Chart: Retrying safe mode...", e);
        try { res = await run(true); } catch (e2) { return; }
    }

    if (!res || !res.data) return;

    const totals = new Array(12).fill(0);
    const specVals = new Array(12).fill(0);
    const retroVals = new Array(12).fill(0);

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

    const specRates = totals.map((t, i) => t > 0 ? ((specVals[i] / t) * 100).toFixed(1) : 0);
    const retroRates = totals.map((t, i) => t > 0 ? ((retroVals[i] / t) * 100).toFixed(1) : 0);

    strategyChartInstance.data.datasets[0].data = totals;
    strategyChartInstance.data.datasets[1].data = specRates;
    strategyChartInstance.data.datasets[2].data = retroRates;
    strategyChartInstance.update();
}
