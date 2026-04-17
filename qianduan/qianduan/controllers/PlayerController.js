class PlayerController {
    constructor() {
        this.audio = null;
        this.unsubscribers = [];
        this.listeningSet = [];
        this.currentSetIndex = 0;
        this.simulatedMode = false;
        this.simulatedAnimationId = null;
        this.boundTranscriptEvents = false;
        this.init();
    }

    async init() {
        // 确保ThemeManager存在
        if (!window.ThemeManager) {
            window.ThemeManager = {
                init: function() {
                    console.log('ThemeManager initialized');
                }
            };
        }
        this.setupStorageListener(); 
        this.audio = document.getElementById('audioPlayer');
        this.setupUIHandlers();
        this.subscribeToStore();
        this.applyTranscriptPreference();
        await this.loadPageData();
        this.setupListeningSelector();
    }

setupStorageListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'settings') {
            this.applyTranscriptPreference();
        }
    });
}

    async loadPageData() {
        const listeningId = this.getListeningIdFromURL();
        if (!listeningId) return;

        localStorage.setItem('lastListeningId', listeningId);
        const targetLineNumber = this.getTargetLineNumberFromURL();
        const setParams = this.getSetParamsFromURL();
        if (setParams) {
            await this.loadListeningSet(setParams.year, setParams.month, setParams.level, setParams.setNumber, setParams.type);
        } else {
            this.restoreListeningSetFromCache(listeningId);
        }

        try {
            const detail = await LoadingManager.withLoading(listeningService.getDetail(listeningId), { loadingText: '加载听力信息...' });
            const material = detail?.data;
            const savedPosition = Number.parseFloat(localStorage.getItem(`position_${listeningId}`) || '0');

            if (material) {
                listeningStore.setCurrentListening(material);
                this.updatePageTitle(material.title, material.setNumber);
                this.updateFavoriteButton(material.isCollected);
                this.updateProgressIndicator();
                if (material.audioUrl) {
                    this.setupRealAudio(material.audioUrl);
                } else {
                    this.setupSimulatedAudio(material.duration);
                }
            }

            const transcript = await LoadingManager.withLoading(listeningService.getTranscript(listeningId), { loadingText: '加载听力原文...' });
            const lines = transcript?.data?.lines || transcript?.data || [];
            listeningStore.setTranscript(lines);
            this.calculateLineTimes(lines);
            this.renderTranscript(lines);

            if (targetLineNumber != null) {
                this.focusLineByNumber(targetLineNumber);
            } else if (savedPosition > 0) {
                this.restoreLastPosition(savedPosition);
                if (!this.simulatedMode && this.audio) {
                    this.audio.currentTime = savedPosition;
                } else {
                    listeningStore.setState({ currentTime: savedPosition });
                }
            }
        } catch (error) {
            console.error('Failed to load page data:', error);
            ToastManager.error(error.code === 401 ? '请先登录' : '加载数据失败，请刷新重试');
        }
    }

    applyTranscriptPreference() {
    const settingsStr = localStorage.getItem('settings');
    let alwaysClear = false;
    if (settingsStr) {
        try {
            const settings = JSON.parse(settingsStr);
            alwaysClear = settings.showTranscript === true;
        } catch(e) {
            console.error('Failed to parse settings:', e);
        }
    }
    const container = document.querySelector('.transcript-container');
    if (!container) return;

    if (alwaysClear) {
        container.classList.remove('blurred');
        container.classList.add('revealed');
        const revealBtn = document.getElementById('revealBtn');
        if (revealBtn) {
            revealBtn.classList.add('active');
            revealBtn.style.pointerEvents = 'none';
            revealBtn.style.opacity = '0.5';
        }
    } else {
        container.classList.remove('revealed');
        container.classList.add('blurred');
        const revealBtn = document.getElementById('revealBtn');
        if (revealBtn) {
            revealBtn.classList.remove('active');
            revealBtn.style.pointerEvents = '';
            revealBtn.style.opacity = '';
        }
    }
}

    restoreListeningSetFromCache(listeningId) {
        const cachedSet = sessionStorage.getItem('currentListeningSet');
        if (!cachedSet) return;
        try {
            this.listeningSet = JSON.parse(cachedSet);
            this.currentSetIndex = this.listeningSet.findIndex(item => item.id === listeningId);
            if (this.currentSetIndex === -1) this.currentSetIndex = 0;
        } catch {
            sessionStorage.removeItem('currentListeningSet');
            this.listeningSet = [];
            this.currentSetIndex = 0;
        }
    }

    async loadListeningSet(year, month, level, setNumber, type = null) {
        try {
            const response = await listeningService.getListeningSet(year, month, level, setNumber, type);
            if (!response?.data?.length) return;
            this.listeningSet = response.data;
            sessionStorage.setItem('currentListeningSet', JSON.stringify(this.listeningSet));
            const currentId = this.getListeningIdFromURL();
            this.currentSetIndex = this.listeningSet.findIndex(item => item.id === currentId);
            if (this.currentSetIndex === -1) this.currentSetIndex = 0;
        } catch (error) {
            console.error('Failed to load listening set:', error);
        }
    }

    getSetParamsFromURL() {
        const params = new URLSearchParams(window.location.search);
        const year = params.get('year');
        const level = params.get('level');
        const setNumber = params.get('setNumber');
        const month = params.get('month');
        const type = params.get('type');
        if ((year && level && setNumber) || (level && type)) {
            return {
                year: year ? Number.parseInt(year, 10) : null,
                level: level ? Number.parseInt(level, 10) : null,
                setNumber: setNumber ? Number.parseInt(setNumber, 10) : null,
                month: month ? Number.parseInt(month, 10) : null,
                type: type || null
            };
        }
        return null;
    }

    updateProgressIndicator() {
        if (!this.listeningSet.length) return;
        const rightActions = document.querySelector('.header-right-actions');
        if (!rightActions) return;
        let indicator = rightActions.querySelector('.set-progress-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'set-progress-indicator';
            rightActions.appendChild(indicator);
        }
        indicator.textContent = `(${this.currentSetIndex + 1}/${this.listeningSet.length})`;
    }

    // 设置听力材料选择器
    setupListeningSelector() {
        const selectorBtn = document.getElementById('listeningSelectorBtn');
        const selectorMenu = document.getElementById('listeningSelectorMenu');
        const selectorWrapper = document.querySelector('.listening-selector-wrapper');
        
        if (!selectorBtn || !selectorMenu) return;
        
        // 切换选择器菜单显示/隐藏
        selectorBtn.addEventListener('click', () => {
            selectorWrapper.classList.toggle('active');
        });
        
        // 点击其他地方关闭选择器菜单
        document.addEventListener('click', (e) => {
            if (!selectorWrapper.contains(e.target)) {
                selectorWrapper.classList.remove('active');
            }
        });
        
        // 生成选择器选项
        this.updateListeningSelector();
    }

    // 更新听力材料选择器选项
    updateListeningSelector() {
        const selectorMenu = document.getElementById('listeningSelectorMenu');
        const selectorText = document.querySelector('.selector-text');
        const currentId = this.getListeningIdFromURL();
        
        if (!selectorMenu || !selectorText) return;
        
        // 清空菜单
        selectorMenu.innerHTML = '';
        
        if (this.listeningSet.length === 0) {
            // 如果没有听力材料集合，使用默认的CET-4听力材料
            const defaultListening = [
                { id: 'cet4_202406_news1', title: '2024年6月 CET-4 听力 - 新闻 1' },
                { id: 'cet4_202406_news2', title: '2024年6月 CET-4 听力 - 新闻 2' },
                { id: 'cet4_202406_news3', title: '2024年6月 CET-4 听力 - 新闻 3' },
                { id: 'cet4_202406_conversation1', title: '2024年6月 CET-4 听力 - 对话 1' },
                { id: 'cet4_202406_conversation2', title: '2024年6月 CET-4 听力 - 对话 2' },
                { id: 'cet4_202406_passage1', title: '2024年6月 CET-4 听力 - 短文 1' },
                { id: 'cet4_202406_passage2', title: '2024年6月 CET-4 听力 - 短文 2' }
            ];
            
            defaultListening.forEach((item, index) => {
                const option = document.createElement('button');
                option.className = `selector-option ${item.id === currentId ? 'active' : ''}`;
                option.textContent = item.title;
                option.dataset.id = item.id;
                
                option.addEventListener('click', () => {
                    window.location.href = `index.html?id=${item.id}`;
                });
                
                selectorMenu.appendChild(option);
            });
            
            // 更新选择器文本
            const currentItem = defaultListening.find(item => item.id === currentId);
            selectorText.textContent = currentItem ? currentItem.title : '选择听力';
        } else {
            // 使用加载的听力材料集合
            this.listeningSet.forEach((item, index) => {
                const option = document.createElement('button');
                option.className = `selector-option ${item.id === currentId ? 'active' : ''}`;
                option.textContent = item.title;
                option.dataset.id = item.id;
                
                option.addEventListener('click', () => {
                    window.location.href = `index.html?id=${item.id}`;
                });
                
                selectorMenu.appendChild(option);
            });
            
            // 更新选择器文本
            const currentItem = this.listeningSet.find(item => item.id === currentId);
            selectorText.textContent = currentItem ? currentItem.title : '选择听力';
        }
    }

    restoreLastPosition(savedTime) {
        const lines = listeningStore.getState().transcript || [];
        for (let i = lines.length - 1; i >= 0; i -= 1) {
            if ((lines[i].startTime || 0) <= savedTime) {
                listeningStore.setCurrentLine(i);
                this.highlightCurrentLine(i);
                ToastManager.info('已定位到上次播放位置');
                break;
            }
        }
    }

    getListeningIdFromURL() {
        const id = new URLSearchParams(window.location.search).get('id');
        if (id) return id;
        const lastId = localStorage.getItem('lastListeningId');
        window.location.href = lastId ? `index.html?id=${encodeURIComponent(lastId)}` : 'index.html?id=2024-6-cet4-News-Report-1';
        return '';
    }

    getTargetLineNumberFromURL() {
        const value = new URLSearchParams(window.location.search).get('line');
        if (!value) {
            return null;
        }
        const lineNumber = Number.parseInt(value, 10);
        return Number.isNaN(lineNumber) ? null : lineNumber;
    }

    focusLineByNumber(lineNumber) {
        const lines = listeningStore.getState().transcript || [];
        const index = lines.findIndex((line, lineIndex) => this.getLineNumber(line, lineIndex) === lineNumber);
        if (index < 0) {
            return;
        }

        const line = lines[index];
        const startTime = line.startTime || 0;
        listeningStore.setCurrentLine(index);
        listeningStore.setState({ currentTime: startTime });
        this.highlightCurrentLine(index);

        if (!this.simulatedMode && this.audio) {
            this.audio.currentTime = startTime;
            this.audio.pause();
        }

        ToastManager.info(`已定位到第 ${lineNumber} 句`);
    }

    calculateLineTimes(lines) {
        if (!Array.isArray(lines) || !lines.length) return;
        const totalTime = listeningStore.getState().totalTime || listeningStore.getState().currentListening?.duration || 150;
        const avgDuration = totalTime / lines.length;
        lines.forEach((line, index) => {
            if (line.startTime == null) line.startTime = index * avgDuration;
            if (line.endTime == null) line.endTime = (index + 1) * avgDuration;
        });
    }

    updatePageTitle(title, setNumber) {
        const titleEl = document.querySelector('.page-title');
        if (!titleEl || !title) return;
        titleEl.textContent = setNumber && setNumber > 1 ? `${title} - 第 ${setNumber} 套` : title;
    }

    updateFavoriteButton(isCollected) {
        document.getElementById('listeningFavoriteBtn')?.classList.toggle('active', Boolean(isCollected));
    }

    setupRealAudio(audioUrl) {
        if (!this.audio) return;
        this.simulatedMode = false;
        this.audio.src = audioUrl;
        this.audio.load();
        this.audio.addEventListener('loadedmetadata', () => {
            listeningStore.setState({ totalTime: this.audio.duration || 150 });
            this.calculateLineTimes(listeningStore.getState().transcript || []);
            this.updateTimeDisplay();
        }, { once: true });
        this.audio.addEventListener('timeupdate', () => {
            const currentTime = this.audio.currentTime;
            listeningStore.setState({ currentTime });
            this.syncTranscriptHighlight(currentTime);
            this.checkLoopRange(currentTime);
            const currentListening = listeningStore.getState().currentListening;
            if (currentListening?.id) localStorage.setItem(`position_${currentListening.id}`, String(currentTime));
        });
        this.audio.addEventListener('ended', () => {
            const state = listeningStore.getState();
            if (state.loopEnabled && state.loopLine != null) {
                const line = state.transcript?.[state.loopLine];
                this.audio.currentTime = line?.startTime ?? 0;
                this.audio.play().catch(() => listeningStore.setPlaying(false));
                return;
            }
            listeningStore.setPlaying(false);
            this.handlePlaybackEnded();
        });
        this.audio.addEventListener('play', () => listeningStore.setPlaying(true));
        this.audio.addEventListener('pause', () => listeningStore.setPlaying(false));
        this.audio.volume = listeningStore.getState().volume || 0.8;
    }

    setupSimulatedAudio(duration = 150) {
        this.simulatedMode = true;
        listeningStore.setState({ totalTime: duration || 150, currentTime: 0 });
        this.updateTimeDisplay();
    }

    subscribeToStore() {
        this.unsubscribers.push(listeningStore.subscribe('playing', (playing) => {
            this.updatePlayButton(playing);
            if (!this.simulatedMode && this.audio) {
                if (playing && this.audio.paused) this.audio.play().catch(() => listeningStore.setPlaying(false));
                if (!playing && !this.audio.paused) this.audio.pause();
            }
        }));
        this.unsubscribers.push(listeningStore.subscribe('currentTime', (currentTime) => {
            this.updateProgress(currentTime);
            this.updateTimeDisplay();
        }));
        this.unsubscribers.push(listeningStore.subscribe('totalTime', () => this.updateTimeDisplay()));
    }

    setupUIHandlers() {
        document.getElementById('playBtn')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('progressBar')?.addEventListener('click', (e) => {
            const state = listeningStore.getState();
            if (!state.totalTime) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newTime = percent * state.totalTime;
            listeningStore.setState({ currentTime: newTime });
            if (!this.simulatedMode && this.audio) this.audio.currentTime = newTime;
            this.syncTranscriptHighlight(newTime);
        });
        this.setupSpeedControl();
        this.setupLoopControl();
        this.setupRevealControl();
        this.setupListeningFavoriteControl();
        this.setupFeedbackButtons();
        this.setupTranscriptClickHandlers();
    }

    togglePlay() {
        if (this.simulatedMode) {
            const state = listeningStore.getState();
            listeningStore.setPlaying(!state.playing);
            if (!state.playing) this.startSimulation();
            return;
        }
        if (!this.audio?.src) return;
        if (this.audio.paused) {
            this.audio.play().catch(err => {
                console.warn('Playback failed:', err);
                ToastManager.error('播放失败，请检查音频文件');
            });
        } else {
            this.audio.pause();
        }
    }

    startSimulation() {
        const state = listeningStore.getState();
        if (state.loopEnabled && state.loopLine != null) {
            this.simulateLoop();
        } else {
            this.simulateNormal();
        }
    }

    simulateNormal() {
        cancelAnimationFrame(this.simulatedAnimationId);
        const step = () => {
            const state = listeningStore.getState();
            if (!state.playing) return;
            const newTime = state.currentTime + 0.1;
            if (newTime >= state.totalTime) {
                listeningStore.setState({ currentTime: state.totalTime, playing: false });
                this.handlePlaybackEnded();
                return;
            }
            listeningStore.setState({ currentTime: newTime });
            this.syncTranscriptHighlight(newTime);
            this.simulatedAnimationId = requestAnimationFrame(step);
        };
        this.simulatedAnimationId = requestAnimationFrame(step);
    }

    simulateLoop() {
        cancelAnimationFrame(this.simulatedAnimationId);
        const state = listeningStore.getState();
        const line = state.transcript?.[state.loopLine];
        if (!line) return this.simulateNormal();
        let currentTime = state.currentTime || line.startTime || 0;
        const step = () => {
            const latestState = listeningStore.getState();
            if (!latestState.playing || !latestState.loopEnabled) return this.simulateNormal();
            currentTime += 0.1;
            if (currentTime >= (line.endTime || latestState.totalTime)) currentTime = line.startTime || 0;
            listeningStore.setState({ currentTime });
            this.syncTranscriptHighlight(currentTime);
            this.simulatedAnimationId = requestAnimationFrame(step);
        };
        this.simulatedAnimationId = requestAnimationFrame(step);
    }

    checkLoopRange(currentTime) {
        const state = listeningStore.getState();
        if (!state.loopEnabled || state.loopLine == null) return;
        const line = state.transcript?.[state.loopLine];
        if (!line) return;
        const startTime = line.startTime || 0;
        const endTime = line.endTime || state.totalTime;
        if (currentTime >= endTime || currentTime < startTime) {
            if (!this.simulatedMode && this.audio) this.audio.currentTime = startTime;
            else listeningStore.setState({ currentTime: startTime });
        }
    }

    handlePlaybackEnded() {
        const container = document.querySelector('.transcript-container');
        if (container) {
            container.classList.remove('blurred');
            container.classList.add('revealing');
            setTimeout(() => container.classList.remove('revealing'), 1500);
        }
        ToastManager.success('播放完成，原文已全部显示');
    }

    updatePlayButton(playing) {
        const icon = document.getElementById('playBtn')?.querySelector('svg');
        if (!icon) return;
        icon.innerHTML = playing
            ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
            : '<polygon points="5 3 19 12 5 21 5 3"/>';
    }

    updateProgress(currentTime) {
        const totalTime = listeningStore.getState().totalTime || 0;
        const percent = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;
        const progressFill = document.getElementById('progressFill');
        const progressHandle = document.getElementById('progressHandle');
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressHandle) progressHandle.style.left = `${percent}%`;
    }

    updateTimeDisplay() {
        const state = listeningStore.getState();
        const currentTimeEl = document.querySelector('.current-time');
        const totalTimeEl = document.querySelector('.total-time');
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(state.currentTime || 0);
        if (totalTimeEl) totalTimeEl.textContent = this.formatTime(state.totalTime || 0);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    renderTranscript(lines) {
        const container = document.querySelector('.transcript-container');
        if (!container || !lines?.length) return;
        const state = listeningStore.getState();
        container.innerHTML = lines.map((line, index) => {
            const lineNumber = this.getLineNumber(line, index);
            const feedback = state.feedback[lineNumber] || '';
            const isFavorite = this.isLineFavorited(lineNumber);
            const isCurrent = index === state.currentLine;
            return `
                <div class="transcript-item ${isCurrent ? 'current' : ''}" data-line="${lineNumber}" data-index="${index}" data-id="${line.id || ''}">
                    <div class="speaker-avatar ${(line.speaker || 'W') === 'M' ? 'male' : 'female'}"><span>${this.escapeHtml(line.speaker || 'W')}</span></div>
                    <div class="transcript-bubble">
                        <p>${this.escapeHtml(line.text || line.content || '')}</p>
                        ${feedback ? `<span class="feedback-tag ${feedback}">${this.getFeedbackLabel(feedback)}</span>` : ''}
                    </div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" title="收藏这句话" data-line="${lineNumber}">
                        <svg viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
    }

    getLineNumber(line, index) {
        return line.lineNumber || line.number || index + 1;
    }

    getCurrentUserId() {
        return authService?.getUser?.()?.id || App?.getUser?.()?.id || null;
    }

    getStoredLineFavorites() {
        const favorites = JSON.parse(localStorage.getItem('lineFavorites') || '[]');
        const userId = this.getCurrentUserId();
        return favorites.filter((item) => {
            if (item.userId == null) {
                return true;
            }
            return userId != null && item.userId === userId;
        });
    }

    escapeHtml(value) {
        return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
    }

    isLineFavorited(lineNumber) {
        const favorites = this.getStoredLineFavorites();
        return favorites.some(item => item.listeningId === this.getListeningIdFromURL() && item.lineNumber === lineNumber);
    }

    getFeedbackLabel(feedback) {
        return { understood: '已听懂', familiar: '较熟悉', unfamiliar: '仍陌生' }[feedback] || '';
    }

    syncTranscriptHighlight(currentTime) {
        const state = listeningStore.getState();
        const lines = state.transcript || [];
        let newLineIndex = -1;
        for (let i = 0; i < lines.length; i += 1) {
            const startTime = lines[i].startTime ?? (i * (state.totalTime / lines.length));
            const endTime = lines[i].endTime ?? ((i + 1) * (state.totalTime / lines.length));
            if (currentTime >= startTime && currentTime < endTime) {
                newLineIndex = i;
                break;
            }
        }
        if (newLineIndex !== state.currentLine) {
            listeningStore.setCurrentLine(newLineIndex);
            this.highlightCurrentLine(newLineIndex);
        }
    }

    highlightCurrentLine(index) {
        document.querySelectorAll('.transcript-item').forEach((item, itemIndex) => item.classList.toggle('current', itemIndex === index));
        if (index < 0) return;

        const container = document.querySelector('.transcript-container');
        const currentItem = document.querySelector(`.transcript-item[data-index="${index}"]`);
        if (!container || !currentItem) return;

        const itemTop = currentItem.offsetTop;
        const itemBottom = itemTop + currentItem.offsetHeight;
        const visibleTop = container.scrollTop;
        const visibleBottom = visibleTop + container.clientHeight;
        const targetScrollTop = itemTop - (container.clientHeight - currentItem.offsetHeight) / 2;

        if (itemTop < visibleTop || itemBottom > visibleBottom) {
            container.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
            });
        }
    }

    setupSpeedControl() {
        const speedBtn = document.getElementById('speedBtn');
        const speedMenu = document.getElementById('speedMenu');
        if (!speedBtn || !speedMenu) return;
        speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            speedMenu.classList.toggle('active');
        });
        document.addEventListener('click', () => speedMenu.classList.remove('active'));
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const speed = Number.parseFloat(option.dataset.speed);
                document.querySelectorAll('.speed-option').forEach(item => item.classList.remove('active'));
                option.classList.add('active');
                speedMenu.classList.remove('active');
                if (document.querySelector('.speed-text')) document.querySelector('.speed-text').textContent = `${speed}x`;
                if (this.audio) this.audio.playbackRate = speed;
                listeningStore.setState({ playbackSpeed: speed });
                ToastManager.info(`播放速度已调整为 ${speed}x`);
            });
        });
    }

    setupLoopControl() {
        const loopBtn = document.getElementById('loopBtn');
        loopBtn?.addEventListener('click', () => {
            const state = listeningStore.getState();
            const enabled = !state.loopEnabled;
            listeningStore.setState(enabled && state.currentLine !== null ? { loopEnabled: true, loopLine: state.currentLine } : { loopEnabled: false, loopLine: null });
            loopBtn.classList.toggle('active', enabled);
            ToastManager.info(enabled ? `已开启单句循环，当前循环第 ${state.currentLine + 1} 句` : '已关闭单句循环');
        });
    }

    setupRevealControl() {
        const revealBtn = document.getElementById('revealBtn');
        const container = document.querySelector('.transcript-container');
        revealBtn?.addEventListener('click', () => {
            container?.classList.remove('blurred');
            container?.classList.add('revealed');
            revealBtn.classList.add('active');
            ToastManager.success('原文已显示');
        });
    }

    setupListeningFavoriteControl() {
        const button = document.getElementById('listeningFavoriteBtn');
        button?.addEventListener('click', async () => {
            const listeningId = this.getListeningIdFromURL();
            const active = button.classList.contains('active');
            try {
                if (active) {
                    await LoadingManager.withLoading(userService.removeCollection(listeningId), { loadingText: '取消收藏...' });
                    ToastManager.success('已取消收藏这篇听力');
                } else {
                    // 获取当前页面的完整标题，包含套数信息
                    const titleEl = document.querySelector('.page-title');
                    const fullTitle = titleEl ? titleEl.textContent : '';
                    await LoadingManager.withLoading(userService.addCollection(listeningId, fullTitle), { loadingText: '添加收藏...' });
                    ToastManager.success('已收藏这篇听力');
                }
                const state = listeningStore.getState();
                if (state.currentListening) {
                    listeningStore.setState({ currentListening: { ...state.currentListening, isCollected: !active } });
                }
                button.classList.toggle('active', !active);
            } catch (error) {
                console.error('Failed to update collection:', error);
                ToastManager.error(active ? '取消收藏失败' : '添加收藏失败');
            }
        });
    }

    setupFeedbackButtons() {
        const listeningId = this.getListeningIdFromURL();
        // 检查并更新反馈按钮状态
        this.updateFeedbackButtonStates(listeningId);
        
        document.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const feedbackType = btn.dataset.feedback;
                const transcript = listeningStore.getState().transcript || [];
                const statusMap = { understood: 'UNDERSTOOD', familiar: 'FAMILIAR', unfamiliar: 'UNFAMILIAR' };
                const currentState = this.getCurrentFeedbackState(listeningId);
                
                if (feedbackType === currentState) {
                    // 如果点击的是当前激活的按钮，提供移除功能
                    const confirmed = await DialogManager.confirm(`确定要从${feedbackType === 'understood' ? '听懂' : feedbackType === 'familiar' ? '熟悉' : '陌生'}中移除该听力材料吗？`);
                    if (confirmed) {
                        // 从已删除记录列表中添加该听力材料的ID
                        this.addToRemovedRecords(listeningId);
                        // 更新按钮状态
                        this.updateFeedbackButtonStates(listeningId);
                        ToastManager.success(`已从${feedbackType === 'understood' ? '听懂' : feedbackType === 'familiar' ? '熟悉' : '陌生'}中移除`);
                    }
                    return;
                }
                
                // 如果点击的是未激活的按钮，检查是否已有其他激活的按钮
                if (currentState) {
                    // 显示确认对话框，询问是否要从当前状态中移除并添加到新状态
                    const confirmed = await DialogManager.confirm(`确定要将该听力材料从${currentState === 'understood' ? '听懂' : currentState === 'familiar' ? '熟悉' : '陌生'}中移除并添加到${feedbackType === 'understood' ? '听懂' : feedbackType === 'familiar' ? '熟悉' : '陌生'}中吗？`);
                    if (!confirmed) {
                        return;
                    }
                }
                
                btn.style.transform = 'scale(0.96)';
                setTimeout(() => { btn.style.transform = ''; }, 180);
                try {
                    await LoadingManager.withLoading(Promise.all(transcript.map((line, index) => listeningService.submitFeedback(listeningId, this.getLineNumber(line, index), statusMap[feedbackType]))), { loadingText: '提交反馈...' });
                    
                    // 从已删除记录列表中移除该听力材料的ID
                    this.removeFromRemovedRecords(listeningId);
                    // 设置新的反馈状态
                    this.setFeedbackState(listeningId, feedbackType);
                    // 更新按钮状态
                    this.updateFeedbackButtonStates(listeningId);
                    
                    ToastManager.success(`已记录整篇听力：${feedbackType === 'understood' ? '听懂' : feedbackType === 'familiar' ? '熟悉' : '陌生'}`);
                } catch (error) {
                    console.error('Failed to submit feedback:', error);
                    ToastManager.error('提交反馈失败');
                }
            });
        });
    }

    // 获取听力材料的当前反馈状态
    getCurrentFeedbackState(listeningId) {
        const feedbackStates = JSON.parse(localStorage.getItem('feedbackStates') || '{}');
        return feedbackStates[listeningId] || null;
    }

    // 设置听力材料的反馈状态
    setFeedbackState(listeningId, feedbackType) {
        const feedbackStates = JSON.parse(localStorage.getItem('feedbackStates') || '{}');
        feedbackStates[listeningId] = feedbackType;
        localStorage.setItem('feedbackStates', JSON.stringify(feedbackStates));
    }

    // 移除听力材料的反馈状态
    removeFeedbackState(listeningId) {
        const feedbackStates = JSON.parse(localStorage.getItem('feedbackStates') || '{}');
        delete feedbackStates[listeningId];
        localStorage.setItem('feedbackStates', JSON.stringify(feedbackStates));
    }

    // 更新反馈按钮状态
    updateFeedbackButtonStates(listeningId) {
        const currentState = this.getCurrentFeedbackState(listeningId);
        
        document.querySelectorAll('.feedback-btn').forEach(btn => {
            const feedbackType = btn.dataset.feedback;
            
            if (feedbackType === currentState) {
                btn.classList.add('active');
                btn.title = `点击从${feedbackType === 'understood' ? '听懂' : feedbackType === 'familiar' ? '熟悉' : '陌生'}中移除`;
            } else {
                btn.classList.remove('active');
                btn.title = `标记为${feedbackType === 'understood' ? '听懂' : feedbackType === 'familiar' ? '熟悉' : '陌生'}`;
            }
        });
    }

    // 将听力材料添加到已删除记录列表中
    addToRemovedRecords(listeningId) {
        const removedRecords = JSON.parse(localStorage.getItem('removedLearningRecords') || '[]');
        if (!removedRecords.includes(listeningId)) {
            removedRecords.push(listeningId);
            localStorage.setItem('removedLearningRecords', JSON.stringify(removedRecords));
        }
        // 同时移除反馈状态
        this.removeFeedbackState(listeningId);
    }

    goToNextListening() {
        if (!this.listeningSet.length) this.restoreListeningSetFromCache(this.getListeningIdFromURL());
        if (!this.listeningSet.length) {
            ToastManager.info('已完成当前内容');
            return setTimeout(() => { window.location.href = 'learning-records.html'; }, 1500);
        }
        this.currentSetIndex += 1;
        if (this.currentSetIndex >= this.listeningSet.length) {
            sessionStorage.removeItem('currentListeningSet');
            ToastManager.success('本套题已完成，去看看学习记录吧。');
            return setTimeout(() => { window.location.href = 'learning-records.html'; }, 1800);
        }
        const nextItem = this.listeningSet[this.currentSetIndex];
        const progress = Math.round((this.currentSetIndex / this.listeningSet.length) * 100);
        ToastManager.info(`进度已到 ${progress}%，继续加油。`);
        const params = new URLSearchParams({ id: nextItem.id });
        const setParams = this.getSetParamsFromURL();
        if (setParams?.level != null) params.set('level', setParams.level);
        if (setParams?.type) params.set('type', setParams.type);
        if (setParams?.year != null) params.set('year', setParams.year);
        if (setParams?.setNumber != null) params.set('setNumber', setParams.setNumber);
        if (setParams?.month != null) params.set('month', setParams.month);
        localStorage.setItem('lastListeningId', nextItem.id);
        setTimeout(() => { window.location.href = `index.html?${params.toString()}`; }, 1500);
    }

    // 从已删除记录列表中移除指定的听力材料ID
    removeFromRemovedRecords(listeningId) {
        const removedRecords = JSON.parse(localStorage.getItem('removedLearningRecords') || '[]');
        // 过滤掉与当前听力材料ID相关的记录
        const updatedRemovedRecords = removedRecords.filter(recordId => {
            // 假设recordId包含listeningId信息，或者直接就是listeningId
            return !recordId.includes(listeningId);
        });
        localStorage.setItem('removedLearningRecords', JSON.stringify(updatedRemovedRecords));
    }

    setupTranscriptClickHandlers() {
        if (this.boundTranscriptEvents) return;
        const container = document.querySelector('.transcript-container');
        if (!container) return;
        this.boundTranscriptEvents = true;
        container.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('.favorite-btn');
            if (favoriteBtn) {
                e.stopPropagation();
                return this.toggleLineFavorite(favoriteBtn);
            }
            const item = e.target.closest('.transcript-item');
            if (!item) return;
            const index = Number.parseInt(item.dataset.index, 10);
            const state = listeningStore.getState();
            const line = state.transcript?.[index];
            if (!line) return;
            const startTime = line.startTime || 0;
            listeningStore.setCurrentLine(index);
            listeningStore.setState({ currentTime: startTime });
            this.highlightCurrentLine(index);
            if (!this.simulatedMode && this.audio) this.audio.currentTime = startTime;
            ToastManager.info(`已定位到第 ${this.getLineNumber(line, index)} 句`);
            if (state.loopEnabled) {
                listeningStore.setState({ loopLine: index });
                ToastManager.info(`当前循环第 ${index + 1} 句`);
            }
        });
    }

    toggleLineFavorite(button) {
        const lineNumber = Number.parseInt(button.dataset.line, 10);
        const listeningId = this.getListeningIdFromURL();
        const active = button.classList.contains('active');
        const transcriptItem = button.closest('.transcript-item');
        const lineIndex = Number.parseInt(transcriptItem?.dataset.index || '-1', 10);
        const currentListening = listeningStore.getState().currentListening || {};
        const line = listeningStore.getState().transcript?.[lineIndex] || {};
        const favorites = JSON.parse(localStorage.getItem('lineFavorites') || '[]');
        const userId = this.getCurrentUserId();
        const nextFavorites = active
            ? favorites.filter((item) => !(item.listeningId === listeningId && item.lineNumber === lineNumber && ((item.userId ?? null) === userId || item.userId == null)))
            : [
                ...favorites.filter((item) => !(item.listeningId === listeningId && item.lineNumber === lineNumber && ((item.userId ?? null) === userId || item.userId == null))),
                {
                    userId,
                    listeningId,
                    listeningTitle: currentListening.title || currentListening.listeningTitle || '',
                    lineNumber,
                    text: line.text || line.content || '',
                    speaker: line.speaker || '',
                    createdAt: new Date().toISOString()
                }
            ];
        localStorage.setItem('lineFavorites', JSON.stringify(nextFavorites));
        button.classList.toggle('active', !active);
        button.querySelector('svg')?.setAttribute('fill', active ? 'none' : 'currentColor');
        ToastManager[active ? 'info' : 'success'](active ? '已取消收藏' : '已收藏该句');
    }

    destroy() {
        if (this.simulatedAnimationId) cancelAnimationFrame(this.simulatedAnimationId);
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }
}

window.PlayerController = PlayerController;
