/*
 * Controls the settings page and local preference actions.
 */

/**
 * Handles settings persistence, logout, and destructive account actions.
 */
class SettingsController {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
             if (typeof ThemeManager !== 'undefined') {
            ThemeManager.apply();
        }
        this.loadSettingsToUI();
        this.setupToggleSwitches();
        this.setupSettingsActions();
        this.setupUserInfo();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('settings');
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch {
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            darkMode: false,
            autoPlay: true,
            showTranscript: false,
            repeatCount: 1,
            playbackSpeed: 1.0,
            autoNext: false,
            notifications: true
        };
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
        ToastManager.success('设置已保存');
    }

    loadSettingsToUI() {
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            const key = toggle.dataset.setting;
            if (key && this.settings.hasOwnProperty(key)) {
                toggle.checked = this.settings[key];
            }
        });

        const repeatCount = document.getElementById('repeatCount');
        if (repeatCount) {
            repeatCount.value = this.settings.repeatCount || 1;
        }

        const playbackSpeed = document.getElementById('playbackSpeed');
        if (playbackSpeed) {
            playbackSpeed.value = this.settings.playbackSpeed || 1.0;
        }

        const showTranscript = document.getElementById('showTranscript');
        if (showTranscript && this.settings.hasOwnProperty('showTranscript')) {
            showTranscript.value = this.settings.showTranscript.toString();
        }
    }

    setupToggleSwitches() {
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', () => {
                const key = toggle.dataset.setting;
                const value = toggle.checked;
                
                this.settings[key] = value;
                this.saveSettings();

                const label = toggle.closest('.setting-item').querySelector('.setting-label').textContent;
                ToastManager.success(`${label}已${value ? '开启' : '关闭'}`);

                if (key === 'darkMode') {
                    ThemeManager.apply();
                }
            });
        });
    }

    // applyDarkMode(enabled) {
    //     document.body.classList.toggle('dark-mode', enabled);
    //     document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
    // }

    setupSettingsActions() {
        const clearRecordsBtn = document.querySelector('.btn-danger');
        clearRecordsBtn?.addEventListener('click', async () => {
            const confirmed = await DialogManager.danger(
                '确定要清除所有学习记录吗？此操作不可恢复。',
                {
                    confirmText: '清除',
                    cancelText: '取消',
                    type: 'danger'
                }
            );

            if (confirmed) {
                try {
                    await LoadingManager.withLoading(
                        userService.clearLearningRecords(),
                        { loadingText: '清除中...' }
                    );
                    
                    ToastManager.success('学习记录已全部清除');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } catch (error) {
                    console.error('Failed to clear records:', error);
                    ToastManager.error('清除失败，请稍后重试');
                }
            }
        });

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn?.addEventListener('click', async () => {
            const confirmed = await DialogManager.confirm(
                '确定要退出登录吗？',
                {
                    confirmText: '退出',
                    cancelText: '取消',
                    type: 'warning'
                }
            );

            if (confirmed) {
                try {
                    ToastManager.info('正在退出...');
                    await App.logout();
                } catch (error) {
                    console.error('Logout failed:', error);
                    ToastManager.error('退出失败');
                }
            }
        });

        this.setupSelectControls();
    }

    setupSelectControls() {
        const repeatCount = document.getElementById('repeatCount');
        repeatCount?.addEventListener('change', (e) => {
            this.settings.repeatCount = parseInt(e.target.value);
            this.saveSettings();
            ToastManager.success(`循环次数已设置为 ${e.target.value} 次`);
        });

        const playbackSpeed = document.getElementById('playbackSpeed');
        playbackSpeed?.addEventListener('change', (e) => {
            this.settings.playbackSpeed = parseFloat(e.target.value);
            this.saveSettings();
            ToastManager.success(`默认播放速度已设置为 ${e.target.value}x`);
        });

        const showTranscript = document.getElementById('showTranscript');
        showTranscript?.addEventListener('change', (e) => {
            this.settings.showTranscript = e.target.value === 'true';
            this.saveSettings();
            ToastManager.success(`默认文本状态已设置为 ${e.target.value === 'true' ? '总是清晰' : '默认模糊'}`);
        });
    }

    setupUserInfo() {
        const user = App.getUser();
        if (user) {
            const usernameEl = document.getElementById('username');
            const emailEl = document.getElementById('userEmail');

            if (usernameEl) {
                usernameEl.textContent = user.username || '用户';
            }
            if (emailEl) {
                emailEl.textContent = user.email || '';
            }
        }
    }
}

window.SettingsController = SettingsController;
