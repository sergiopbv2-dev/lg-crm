document.addEventListener('DOMContentLoaded', () => {

    // Check authentication
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'CRM/index.html';
        return;
    }

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
