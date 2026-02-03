document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        if (validateLogin(email, password)) {
            // Simulate API call / Loading state
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = 'Iniciando...';
            submitButton.style.opacity = '0.8';
            submitButton.disabled = true;

            setTimeout(() => {
                // Redirect to the main dashboard (assuming it's in the parent directory)
                // If this is running in a server, path might need adjustment. 
                // For local file system, ../index.html works.
                sessionStorage.setItem('isLoggedIn', 'true');
                window.location.href = '../index.html';
            }, 1000);
        }
    });

    function validateLogin(email, password) {
        if (!email || !password) {
            alert('Por favor, complete todos los campos.');
            return false;
        }
        // Add more validation logic here if needed
        return true;
    }

    // Input animation effects (optional, handled by CSS mostly)
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
