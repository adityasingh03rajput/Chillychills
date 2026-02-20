document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const adminIdInput = document.getElementById('adminId');
    const errorMessage = document.getElementById('errorMessage');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const quickBtns = document.querySelectorAll('.quick-btn');

    const savedUrl = localStorage.getItem('CHILLY_PROD_URL');
    const API_BASE = savedUrl ? `${savedUrl}/api` : 'http://localhost:3001/api';

    // Toggle Password Visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Update Icon
        const svg = togglePassword.querySelector('svg');
        if (type === 'text') {
            svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        } else {
            svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
    });

    // Quick Access Functionality
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const pass = btn.getAttribute('data-pass');

            adminIdInput.value = id;
            passwordInput.value = pass;

            // Visual feedback
            btn.style.borderColor = 'var(--primary)';
            setTimeout(() => {
                btn.style.borderColor = 'var(--glass-border)';
            }, 500);
        });
    });

    // Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = adminIdInput.value.trim();
        const pass = passwordInput.value.trim();

        // Reset Error
        errorMessage.textContent = '';

        if (!id || !pass) {
            errorMessage.textContent = 'Please fill in all fields';
            return;
        }

        // Show Loading
        loadingOverlay.style.display = 'flex';

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, password: pass })
            }).catch(err => {
                throw new Error('Server Unreachable. Please ensure the backend is running on port 3001.');
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication protocol failed');
            }

            // Security check: Strictly only allow manager to access admin panel
            if (data.user.role !== 'manager') {
                throw new Error('Access denied: Admin Panel is reserved for Manager accounts only');
            }

            // Success - Save session info
            localStorage.setItem('chillyAdmin', JSON.stringify({
                id: data.user.id,
                name: data.user.name,
                role: data.user.role,
                token: data.token,
                loginTime: new Date().toISOString()
            }));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            loadingOverlay.style.display = 'none';
            errorMessage.textContent = error.message;

            // Shake effect on card
            const card = document.querySelector('.login-card');
            card.style.animation = 'none';
            card.offsetHeight; // trigger reflow
            card.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
        }
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
`;
document.head.appendChild(style);
