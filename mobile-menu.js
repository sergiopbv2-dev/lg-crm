(function () {
    console.log("Mobile Menu Script Loaded");

    function initMobileMenu() {
        console.log("Initializing Mobile Menu...");

        let mobileBtn = document.getElementById('mobile-menu-btn');
        let sidebar = document.querySelector('.sidebar');

        // Safety Check: If elements missing, try again in 500ms (sometimes dynamic content loads late)
        if (!mobileBtn || !sidebar) {
            console.log("Elements not found, retrying in 500ms...");
            setTimeout(initMobileMenu, 500);
            return;
        }

        // Create Overlay if missing (Robust Check)
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay'; // This class is styled in responsive.css
            document.body.appendChild(overlay);
        }

        // Toggle Logic
        function toggle(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log("Toggle Menu Clicked!");
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        // Cleanup old listeners (simple overwrite)
        mobileBtn.onclick = toggle;
        overlay.onclick = toggle;

        // Ensure overlay can close it
        overlay.addEventListener('touchstart', toggle, { passive: false }); // Better for mobile

        console.log("Mobile Menu Ready. Button:", mobileBtn, "Sidebar:", sidebar);

        // Close on Link Click (for better UX)
        const links = sidebar.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                }
            });
        });

        console.log("Mobile Menu Initialized");
    }

    // Run Logic
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu(); // DOM already ready
    }
})();
