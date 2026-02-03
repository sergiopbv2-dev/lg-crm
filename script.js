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

    // --- Chart.js Configuration for Revenue Overview ---
    const ctx = document.getElementById('revenueChart').getContext('2d');

    // Gradient Fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(165, 0, 52, 0.2)'); // LG Red transparent
    gradient.addColorStop(1, 'rgba(165, 0, 52, 0)');

    const revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [1200, 1500, 750, 1800, 2400, 2800], // Mock data shaped like the screenshot curve
                borderColor: '#A50034', // LG Primary Red
                backgroundColor: gradient,
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#A50034',
                pointRadius: 0, // Hidden points by default
                pointHoverRadius: 4,
                fill: true,
                tension: 0.4 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f3f5',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        callback: function (value) {
                            return '$' + value;
                        },
                        color: '#868e96',
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#868e96',
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
});
