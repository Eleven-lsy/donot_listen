﻿﻿﻿/*
 * Coordinates app bootstrap, auth checks, and page controller routing.
 */

/**
 * Coordinates page bootstrap, auth validation, and controller selection.
 */
class App {
    constructor() {
        this.currentController = null;
        this.aiTypingTimer = null;
        this.init();
    }

    init() {
        window.scrollTo(0, 0);
        
        const path = window.location.pathname;

        if (this.isRootPath(path)) {
            this.redirectRootByAuth();
            return;
        }

        if (this.isAuthPage(path)) {
            return;
        }

        if (!this.checkAuth()) {
            return;
        }

        this.initNavigation().then(() => {
            this.initSupportModal();
            this.initAISummonButton();
            this.initCurrentPage();
        });
    }

    isAuthPage(path) {
        return path.includes('login.html') ||
               path.includes('register.html') ||
               path.includes('home.html');
    }

    isRootPath(path) {
        return path.endsWith('/') || path.endsWith('donot_listen');
    }

    hasValidSession() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!user || !token) {
            return false;
        }

        try {
            const userData = JSON.parse(user);
            return !!userData.username && !!userData.id && token.length >= 10;
        } catch (error) {
            console.error('Failed to parse user data:', error);
            return false;
        }
    }

    redirectRootByAuth() {
        const target = this.hasValidSession() ? 'index.html' : 'home.html';
        window.location.replace(target);
    }

    checkAuth() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!user || !token) {
            this.redirectToHome();
            return false;
        }

        try {
            const userData = JSON.parse(user);

            if (!userData.username || !userData.id) {
                console.warn('Invalid user data format');
                this.redirectToHome();
                return false;
            }

            if (token.length < 10) {
                console.warn('Invalid token format');
                this.redirectToHome();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to parse user data:', error);
            this.redirectToHome();
            return false;
        }
    }

    redirectToLogin() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        ToastManager.error('璇峰厛鐧诲綍');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }

    redirectToHome() {
        const path = window.location.pathname;
        if (path.includes('login.html') || path.includes('register.html') || path.includes('index.html')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            ToastManager.info('请先登录后使用');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 500);
        }
    }

    async initNavigation() {
        const navContainer = document.getElementById('sidebarNav');
        const pageName = this.getCurrentPageName();

        if (navContainer) {
            navContainer.innerHTML = '<div class="nav-section"><div class="nav-section-title">鍔犺浇涓?..</div></div>';
            const navData = await loadNavigation();
            navContainer.innerHTML = buildNavigationHTML(navData);
            initEventListeners();
        }
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path.endsWith('/') || path.endsWith('donot_listen')) {
            return 'index';
        }
        if (path.includes('learning-records.html')) return 'learning-records';
        if (path.includes('favorites.html')) return 'favorites';
        if (path.includes('settings.html')) return 'settings';
        return 'index';
    }

    setupNavigationHandlers() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (item.dataset.href) {
                    e.preventDefault();
                    window.location.href = item.dataset.href;
                }
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    initSupportModal() {
        const supportBtn = document.querySelector('[data-action="support"]');
        const modal = document.getElementById('supportModal');
        const closeBtn = document.getElementById('closeSupportModal');

        if (supportBtn) {
            supportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                modal?.classList.add('active');
            });
        }

        closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        document.querySelectorAll('.payment-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                const wechatQR = document.getElementById('wechatQR');
                const alipayQR = document.getElementById('alipayQR');
                wechatQR?.classList.remove('active');
                alipayQR?.classList.remove('active');

                if (card.dataset.method === 'wechat') alipayQR?.classList.add('active');
                if (card.dataset.method === 'alipay') wechatQR?.classList.add('active');
            });
        });
    }

    initAISummonButton() {
        const aiBtn = document.getElementById('aiSummonBtn');
        const closeBtn = document.getElementById('closeAiModal');
        const modal = document.getElementById('aiModal');
        const playBtn = document.getElementById('aiPlayBtn');
        
        if (aiBtn) {
            aiBtn.addEventListener('click', () => {
                this.handleAISummon();
            });
        }
        
        closeBtn?.addEventListener('click', () => {
            this.stopAITypewriter();
            modal?.classList.remove('active');
            window.speechSynthesis?.cancel();
            playBtn?.classList.remove('playing');
        });
        
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.stopAITypewriter();
                modal.classList.remove('active');
                window.speechSynthesis?.cancel();
                playBtn?.classList.remove('playing');
            }
        });
        
        playBtn?.addEventListener('click', () => {
            this.playCurrentSentence();
        });
    }

    playCurrentSentence() {
        const state = listeningStore.getState();
        const currentLine = state.currentLine;
        const transcript = state.transcript;
        
        if (transcript && transcript[currentLine]) {
            const line = transcript[currentLine];
            const sentence = line.text || line.content;
            
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(sentence);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                utterance.pitch = 1;
                
                const playBtn = document.getElementById('aiPlayBtn');
                
                utterance.onstart = () => {
                    playBtn?.classList.add('playing');
                };
                
                utterance.onend = () => {
                    playBtn?.classList.remove('playing');
                };
                
                utterance.onerror = () => {
                    playBtn?.classList.remove('playing');
                };
                
                window.speechSynthesis.speak(utterance);
            }
        }
    }

    handleAISummon() {
        const state = listeningStore.getState();
        const currentLine = state.currentLine;
        const transcript = state.transcript;
        
        if (transcript && transcript[currentLine]) {
            const line = transcript[currentLine];
            const lineId = line.id;
            const sentence = line.text || line.content;
            
            if (!lineId) {
                ToastManager.error('鏃犳硶鑾峰彇鍙ュ瓙ID锛岃鍒锋柊椤甸潰閲嶈瘯');
                return;
            }
            
            const modal = document.getElementById('aiModal');
            const originalSentenceEl = document.getElementById('aiOriginalSentence');
            const responseEl = document.getElementById('aiResponse');
            
            originalSentenceEl.textContent = sentence;
            responseEl.textContent = '';
            modal?.classList.add('active');
            
            this.fetchAIExplanation(lineId);
        } else {
            ToastManager.warning('璇峰厛閫夋嫨瑕佸垎鏋愮殑鍙ュ瓙');
        }
    }

    async fetchAIExplanation(lineId) {
        try {
            this.stopAITypewriter();
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/ai/explain?lineId=${lineId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!result.msg && result.message) {
                result.msg = result.message;
            }

            const aiResponseText = response.ok && result.code === 0 && result.data
                ? result.data
                : (result.msg || result.message || '获取AI讲解失败');
            this.typeAIResponse(aiResponseText);
        } catch (error) {
            console.error('AI请求失败:', error);
            this.typeAIResponse('网络错误，请稍后重试');
        }
    }

    stopAITypewriter() {
        if (this.aiTypingTimer) {
            clearTimeout(this.aiTypingTimer);
            this.aiTypingTimer = null;
        }
    }

    typeAIResponse(text) {
        const responseEl = document.getElementById('aiResponse');
        if (!responseEl) return;

        this.stopAITypewriter();
        responseEl.textContent = '';

        const content = String(text || '');
        let index = 0;

        const tick = () => {
            if (!document.body.contains(responseEl)) {
                this.stopAITypewriter();
                return;
            }

            const step = content[index] === '\n' ? 1 : Math.min(3, content.length - index);
            index += step;
            responseEl.textContent = content.slice(0, index);

            if (index < content.length) {
                const delay = content[index - 1] === '\n' ? 120 : 28;
                this.aiTypingTimer = setTimeout(tick, delay);
            } else {
                this.aiTypingTimer = null;
            }
        };

        tick();
    }

    // initCurrentPage() {
    //     const path = window.location.pathname;

    //     if (path.includes('index.html') || path.endsWith('/') || path.endsWith('donot_listen')) {
    //         if (typeof PlayerController !== 'undefined') {
    //             this.currentController = new PlayerController();
    //         }
    //     } else if (path.includes('learning-records.html')) {
    //         if (typeof LearningRecordsController !== 'undefined') {
    //             this.currentController = new LearningRecordsController();
    //         }
    //     } else if (path.includes('favorites.html')) {
    //         if (typeof FavoritesController !== 'undefined') {
    //             this.currentController = new FavoritesController();
    //         }
    //     } else if (path.includes('settings.html')) {
    //         if (typeof SettingsController !== 'undefined') {
    //             this.currentController = new SettingsController();
    //         }
    //     }
    // }
    initCurrentPage() {
    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/') || path.endsWith('donot_listen')) {
        if (typeof PlayerController !== 'undefined') {
            this.currentController = new PlayerController();
            window.playerController = this.currentController;  // 挂载到全局
        }
    } else if (path.includes('learning-records.html')) {
        if (typeof LearningRecordsController !== 'undefined') {
            this.currentController = new LearningRecordsController();
            window.learningRecordsController = this.currentController;
        }
    } else if (path.includes('favorites.html')) {
        if (typeof FavoritesController !== 'undefined') {
            this.currentController = new FavoritesController();
            window.favoritesController = this.currentController;
        }
    } else if (path.includes('settings.html')) {
        if (typeof SettingsController !== 'undefined') {
            this.currentController = new SettingsController();
            window.settingsController = this.currentController;
        }
    }
}

    static async logout() {
        try {
            if (typeof authService !== 'undefined') {
                authService.logout();
            } else {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('settings');
                window.location.href = 'home.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('settings');
            window.location.href = 'home.html';
        }
    }

    static getUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }

    static updateUser(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    }
}

window.App = App;

