document.addEventListener('DOMContentLoaded', () => {
    // --- SUPABASE CONFIGURATION ---
    const supabaseUrl = 'https://efbkehhayoxceutvdekw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmYmtlaGhheW94Y2V1dHZkZWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzc0NDIsImV4cCI6MjA4NTcxMzQ0Mn0.nPpkLYX-VcUjrAp47xfaIHhUN5U-PfLbjjrdTt38_k0';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Visual Feedback: Loading
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = 'Conectando...';
        submitButton.style.opacity = '0.8';
        submitButton.disabled = true;

        try {
            // --- ACTUAL LOGIN WITH SUPABASE ---
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                // Login Success
                sessionStorage.setItem('isLoggedIn', 'true');

                // Get User Profile (Context for Multi-tenant)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profile) {
                    sessionStorage.setItem('userConfig', JSON.stringify(profile));
                }

                window.location.href = '../index.html';
            }

        } catch (err) {
            alert('Error de acceso: ' + err.message);
            // Reset Button
            submitButton.innerHTML = originalText;
            submitButton.style.opacity = '1';
            submitButton.disabled = false;
        }
    });

    // Input animation effects
    const inputs = [emailInput, passwordInput];
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('.icon').style.color = '#A50034';
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('.icon').style.color = '#9ca3af';
        });
    });
});
