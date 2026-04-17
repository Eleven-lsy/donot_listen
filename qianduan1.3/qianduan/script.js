/*
 * Bootstraps the correct frontend controller after the DOM is ready.
 */

// 确保ThemeManager存在
if (!window.ThemeManager) {
    window.ThemeManager = {
        init: function() {
            console.log('ThemeManager initialized');
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    ThemeManager.init();
    
    // 初始化侧边栏切换功能
    initSidebarToggle();
    
    if (path.includes('login.html')) {
        if (typeof LoginController !== 'undefined') {
            new LoginController();
        } else {
            console.error('LoginController not loaded');
        }
    } else {
        if (typeof App !== 'undefined') {
            try {
                window.app = new App();
            } catch (error) {
                console.error('App initialization failed:', error);
            }
        } else {
            console.error('App not loaded');
        }
    }
});

// 初始化侧边栏切换功能
function initSidebarToggle() {
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggleBtn && sidebar && sidebarOverlay) {
        // 点击按钮切换侧边栏
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        });
        
        // 点击遮罩关闭侧边栏
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
        
        // 按ESC键关闭侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            }
        });
    }
}
