/*
 * Defines reusable loading, toast, dialog, and error-boundary helpers.
 */

/**
 * Manages theme-related functionality
 */
// class ThemeManager {
//     static init() {
//         // Theme initialization logic
//         console.log('ThemeManager initialized');
//     }
// }

// window.ThemeManager = ThemeManager;


/**
 * Stores inline SVG fragments shared by the loading, toast, and dialog helpers.
 */
const IconConfig = {
    loading: '<div class="spinner-ring"></div>',
    toast: {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    },
    dialog: {
        confirm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    }
};

/**
 * Shows and hides loading overlays around async frontend tasks.
 */
class LoadingManager {
    static show(targetElement = document.body, options = {}) {
        const { text = '加载中...', size = 'medium' } = options;
        const existing = targetElement.querySelector('.loading-overlay');
        if (existing) return existing;

        if (targetElement === document.body) {
            const existingGlobal = document.querySelector('.loading-overlay.global');
            if (existingGlobal) return existingGlobal;
        }

        const overlay = document.createElement('div');
        overlay.className = `loading-overlay ${targetElement === document.body ? 'global' : 'local'}`;
        overlay.innerHTML = `
            <div class="loading-spinner ${size}">
                ${IconConfig.loading}
                <span class="loading-text">${text}</span>
            </div>
        `;

        if (targetElement !== document.body) {
            const computedStyle = window.getComputedStyle(targetElement);
            if (computedStyle.position === 'static') {
                targetElement.style.position = 'relative';
            }
        }

        targetElement.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        return overlay;
    }

    static hide() {
        const overlays = document.querySelectorAll('.loading-overlay');
        overlays.forEach(overlay => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        });
    }

    static async withLoading(promise, options = {}) {
        const { showOverlay = true, target = document.body, loadingText = '加载中...' } = options;

        if (showOverlay) {
            LoadingManager.show(target, { text: loadingText });
        }

        try {
            const result = await promise;
            return result;
        } finally {
            if (showOverlay) {
                LoadingManager.hide();
            }
        }
    }
}

/**
 * Shows transient toast notifications for user feedback.
 */
class ToastManager {
    static container = null;
    static toastQueue = [];
    static maxToasts = 5;
    static isProcessing = false;
    static defaultDuration = 3000;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static setMaxCount(max) {
        this.maxToasts = max;
    }

    static setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    static show(message, type = 'info', duration = null) {
        this.init();

        if (duration === null) {
            duration = this.defaultDuration;
        }

        const existingToasts = this.container.querySelectorAll('.toast:not(.removing)');
        if (existingToasts.length >= this.maxToasts) {
            const oldestToast = existingToasts[0];
            oldestToast.classList.add('removing');
            oldestToast.classList.remove('show');
            setTimeout(() => oldestToast.remove(), 300);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = IconConfig.toast[type] || IconConfig.toast.info;

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="关闭">×</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        if (duration > 0) {
            toast.autoRemoveTimer = setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    static removeToast(toast) {
        if (toast.classList.contains('removing')) return;

        if (toast.autoRemoveTimer) {
            clearTimeout(toast.autoRemoveTimer);
        }

        toast.classList.add('removing');
        toast.classList.remove('show');

        setTimeout(() => {
            toast.remove();
            this.processQueue();
        }, 300);
    }

    static processQueue() {
        if (this.isProcessing || this.toastQueue.length === 0) return;

        this.isProcessing = true;
        const next = this.toastQueue.shift();

        setTimeout(() => {
            this.show(next.message, next.type, next.duration);
            this.isProcessing = false;
            this.processQueue();
        }, 100);
    }

    static success(message, duration) {
        return this.show(message, 'success', duration ?? 3000);
    }

    static error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    static warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    static clear() {
        if (this.container) {
            const toasts = this.container.querySelectorAll('.toast');
            toasts.forEach((toast, index) => {
                setTimeout(() => {
                    toast.classList.add('removing');
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 300);
                }, index * 50);
            });
        }
        this.toastQueue = [];
        this.isProcessing = false;
    }
}

/**
 * Shows confirm, warning, and danger dialogs.
 */
class DialogManager {
    static modal = null;
    static currentResolve = null;

    static init() {
        if (!this.modal) {
            this.modal = document.createElement('div');
            this.modal.className = 'dialog-overlay';
            this.modal.innerHTML = `
                <div class="dialog-container">
                    <div class="dialog-header">
                        <span class="dialog-icon"></span>
                        <h3 class="dialog-title"></h3>
                    </div>
                    <div class="dialog-body"></div>
                    <div class="dialog-footer">
                        <button class="dialog-btn dialog-cancel">取消</button>
                        <button class="dialog-btn dialog-confirm">确定</button>
                    </div>
                </div>
            `;

            const cancelBtn = this.modal.querySelector('.dialog-cancel');
            const confirmBtn = this.modal.querySelector('.dialog-confirm');

            cancelBtn.addEventListener('click', () => this.handleResult(false));
            confirmBtn.addEventListener('click', () => this.handleResult(true));

            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.handleResult(false);
                }
            });

            document.body.appendChild(this.modal);
        }
    }

    static handleResult(result) {
        if (this.currentResolve) {
            this.currentResolve(result);
            this.currentResolve = null;
        }
        this.hide();
    }

    static show(options = {}) {
        const {
            title = '提示',
            message = '',
            type = 'confirm',
            confirmText = '确定',
            cancelText = '取消',
            confirmClass = ''
        } = options;

        this.init();

        const icon = this.modal.querySelector('.dialog-icon');
        const titleEl = this.modal.querySelector('.dialog-title');
        const messageEl = this.modal.querySelector('.dialog-body');
        const confirmBtn = this.modal.querySelector('.dialog-confirm');

        const iconSvg = IconConfig.dialog[type] || IconConfig.dialog.confirm;
        icon.innerHTML = iconSvg;

        const iconClassMap = {
            confirm: '',
            warning: 'warning',
            danger: 'danger'
        };
        icon.className = `dialog-icon ${iconClassMap[type] || ''}`;

        titleEl.textContent = title;
        messageEl.innerHTML = message;
        confirmBtn.textContent = confirmText;
        confirmBtn.className = `dialog-btn dialog-confirm ${confirmClass}`;

        this.modal.querySelector('.dialog-cancel').textContent = cancelText;

        return new Promise((resolve) => {
            this.currentResolve = resolve;
            this.modal.classList.add('active');
        });
    }

    static hide() {
        if (this.modal) {
            this.modal.classList.remove('active');
        }
    }

    static confirm(message, options = {}) {
        return this.show({
            title: options.title || '确认操作',
            message,
            type: 'confirm',
            ...options
        });
    }

    static warning(message, options = {}) {
        return this.show({
            title: options.title || '警告',
            message,
            type: 'warning',
            ...options
        });
    }

    static danger(message, options = {}) {
        return this.show({
            title: options.title || '危险操作',
            message,
            type: 'danger',
            confirmText: options.confirmText || '确认删除',
            confirmClass: 'danger',
            ...options
        });
    }

    static alert(message, options = {}) {
        return this.show({
            title: options.title || '提示',
            message,
            type: 'confirm',
            cancelText: '我知道了',
            confirmText: '确定',
            ...options
        });
    }
}

window.LoadingManager = LoadingManager;
window.ToastManager = ToastManager;
window.DialogManager = DialogManager;

/**
 * Captures global frontend errors and reports them to the user.
 */
class ErrorBoundary {
    static async wrap(asyncFn, errorHandler) {
        try {
            return await asyncFn();
        } catch (error) {
            if (errorHandler) {
                return errorHandler(error);
            }
            console.error('Error:', error);
            ToastManager.error('操作失败，请稍后重试');
            return null;
        }
    }

    static init() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            ToastManager.error('发生了一些错误，请刷新页面重试');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            ToastManager.error('操作失败，请稍后重试');
        });
    }
}

/**
 * 全局主题管理器，统一处理深色模式的读取、应用和跨标签页同步。
 */
const ThemeManager = {
    // 初始化：监听 storage 事件，并在当前页面应用主题
    init() {
        this.apply();                     // 立即应用当前设置
        window.addEventListener('storage', (e) => {
            if (e.key === 'settings') {
                this.apply();             // 其他标签页修改设置时自动同步
            }
        });
    },

    // 根据 localStorage 中的 settings.darkMode 来添加/移除类名和属性
    apply() {
        const settingsStr = localStorage.getItem('settings');
        let darkMode = false;
        if (settingsStr) {
            try {
                const settings = JSON.parse(settingsStr);
                darkMode = settings.darkMode === true;
            } catch (e) {
                console.warn('ThemeManager: 解析 settings 失败', e);
            }
        }
        if (darkMode) {
            document.body.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
};

ErrorBoundary.init();

window.ThemeManager = ThemeManager;
