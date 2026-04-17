/*
 * Controls the login and registration page flows.
 */

class LoginController {
    constructor() {
        this.init();
    }

    init() {
        this.setupForms();
        this.setupPasswordToggles();
        this.redirectIfLoggedIn();
    }

    redirectIfLoggedIn() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (user && token) {
            window.location.href = 'index.html';
        }
    }

    setupForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username')?.value?.trim();
            const password = document.getElementById('password')?.value || '';

            if (!username || !password) {
                ToastManager.error('\u8bf7\u586b\u5199\u7528\u6237\u540d\u6216\u90ae\u7bb1\u548c\u5bc6\u7801');
                return;
            }

            try {
                const response = await LoadingManager.withLoading(
                    authService.login(username, password),
                    { loadingText: '\u6b63\u5728\u767b\u5f55...' }
                );

                if (response.code === 0) {
                    ToastManager.success('\u767b\u5f55\u6210\u529f');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 500);
                }
            } catch (error) {
                console.error('Login failed:', error);
                ToastManager.error(error?.message || '\u767b\u5f55\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7528\u6237\u540d\u3001\u90ae\u7bb1\u6216\u5bc6\u7801');
            }
        });

        registerForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername')?.value?.trim();
            const email = document.getElementById('regEmail')?.value?.trim();
            const password = document.getElementById('regPassword')?.value || '';

            if (!username || !email || !password) {
                ToastManager.error('\u8bf7\u586b\u5199\u5b8c\u6574\u7684\u6ce8\u518c\u4fe1\u606f');
                return;
            }

            try {
                const response = await LoadingManager.withLoading(
                    authService.register(username, email, password),
                    { loadingText: '\u6b63\u5728\u6ce8\u518c...' }
                );

                if (response.code === 0) {
                    ToastManager.success('\u6ce8\u518c\u6210\u529f');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 500);
                }
            } catch (error) {
                console.error('Register failed:', error);
                ToastManager.error(error?.message || '\u6ce8\u518c\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5');
            }
        });

        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'flex';
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerForm) registerForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'flex';
        });
    }

    setupPasswordToggles() {
        const togglePasswordVisibility = (inputId, iconId) => {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (!input || !icon) return;

            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            icon.innerHTML = isPassword
                ? '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'
                : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        };

        document.getElementById('togglePassword')?.addEventListener('click', () => {
            togglePasswordVisibility('password', 'togglePassword');
        });

        document.getElementById('toggleRegPassword')?.addEventListener('click', () => {
            togglePasswordVisibility('regPassword', 'toggleRegPassword');
        });
    }
}

window.LoginController = LoginController;
