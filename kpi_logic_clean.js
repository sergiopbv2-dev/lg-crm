
async function loadKPIs() {
    console.log("--- START Load KPIs ---");
    console.log("Distributor:", myDistributorId, "Admin:", isAdmin);

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
            safeText('kpi-active-deals', count);
        }
    } catch (e) { console.warn("Deals fatal:", e); }

    // 2. TOTAL PIPELINE
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

            if (res.safe) {
                safeText('kpi-spec-total', 'N/A');
                safeText('kpi-retro-total', 'N/A');
                safeText('kpi-spec-rate', '0%');
                safeText('kpi-retro-rate', '0%');
            } else {
                safeText('kpi-spec-total', '$' + spec.toLocaleString('en-US', { maximumFractionDigits: 0 }));
                safeText('kpi-retro-total', '$' + retro.toLocaleString('en-US', { maximumFractionDigits: 0 }));

                const sRate = total > 0 ? ((spec / total) * 100).toFixed(1) : '0.0';
                const rRate = total > 0 ? ((retro / total) * 100).toFixed(1) : '0.0';
                safeText('kpi-spec-rate', sRate + '%');
                safeText('kpi-retro-rate', rRate + '%');
            }
        }
    } catch (e) { console.warn("Pipeline fatal:", e); }

    // 3. MONTH DELIVERIES
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
