/*
 * Controls the learning records page and tabbed summaries.
 */

class LearningRecordsController {
    constructor() {
        this.records = [];
        this.currentTab = 'unfamiliar';
        this.init();
    }

    async init() {
        this.setupTabSwitching();
        this.setupStatisticsCards();
        await this.loadPageData();
    }

    async loadPageData() {
        try {
            const response = await LoadingManager.withLoading(
                userService.getLearningRecords(),
                { loadingText: '加载学习记录...' }
            );

            const payload = response?.data || {};
            let records = payload.records || [];
            
            // 过滤掉已删除的记录
            records = this.filterRemovedRecords(records);
            
            this.records = records;
            this.updateStatistics(payload.statistics || {});
            this.renderRecordLists();
        } catch (error) {
            console.error('Failed to load learning records:', error);
            if (error.code === 401) {
                ToastManager.error('请先登录');
            } else {
                ToastManager.error('加载学习记录失败');
            }
            this.updateStatistics({});
            this.renderEmptyLists();
        }
    }

    updateStatistics(stats) {
        // 基于当前过滤后的记录计算统计数据
        const totalUnfamiliar = this.records.filter(r => (r.unfamiliar || 0) > 0).length;
        const totalFamiliar = this.records.filter(r => (r.familiar || 0) > 0 && (r.understood || 0) === 0).length;
        const totalUnderstood = this.records.filter(r => (r.understood || 0) > 0).length;
        const total = totalUnfamiliar + totalFamiliar + totalUnderstood;

        this.setText('totalAudio', total);
        this.setText('unfamiliarCount', totalUnfamiliar);
        this.setText('familiarCount', totalFamiliar);
        this.setText('understoodCount', totalUnderstood);
        this.setText('unfamiliarTabCount', totalUnfamiliar);
        this.setText('familiarTabCount', totalFamiliar);
        this.setText('understoodTabCount', totalUnderstood);
    }

    setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    renderRecordLists() {
        this.renderRecordList('unfamiliarList', this.filterRecordsByFeedback('unfamiliar'), 'unfamiliar');
        this.renderRecordList('familiarList', this.filterRecordsByFeedback('familiar'), 'familiar');
        this.renderRecordList('understoodList', this.filterRecordsByFeedback('understood'), 'understood');
        this.setupAudioListItems();
    }

    renderRecordList(containerId, records, type) {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        if (records.length === 0) {
            const emptyCopy = {
                unfamiliar: ['暂无未学/陌生记录', '开始学习后，这里会帮你聚合薄弱内容。'],
                familiar: ['暂无熟悉记录', '继续练习后，熟悉内容会出现在这里。'],
                understood: ['暂无听懂记录', '坚持学习后，你的掌握内容会越来越多。']
            };
            const [message, hint] = emptyCopy[type];
            container.innerHTML = this.renderEmptyState(message, hint);
            return;
        }

        container.innerHTML = records.map(record => this.renderRecordItem(record, type)).join('');
    }

    renderEmptyLists() {
        ['unfamiliarList', 'familiarList', 'understoodList'].forEach((listId) => {
            const list = document.getElementById(listId);
            if (list) {
                list.innerHTML = this.renderEmptyState('加载失败', '请稍后刷新页面重试。');
            }
        });
    }

    filterRecordsByFeedback(feedback) {
        return this.records.filter((record) => {
            if (feedback === 'unfamiliar') {
                return (record.unfamiliar || 0) > 0;
            }
            if (feedback === 'familiar') {
                return (record.familiar || 0) > 0 && (record.understood || 0) === 0;
            }
            if (feedback === 'understood') {
                return (record.understood || 0) > 0;
            }
            return false;
        });
    }

    renderRecordItem(record, type) {
        const displayTitle = this.getDisplayTitle(record);
        return `
            <div class="audio-item ${type}-item" data-id="${record.id}" data-listening-id="${record.listeningId}">
                <div class="audio-info">
                    <span class="audio-title">${displayTitle}</span>
                    <span class="audio-meta">${this.getFeedbackText(type, record)}</span>
                </div>
                <div class="audio-actions">
                    <button class="btn-listen" data-listening-id="${record.listeningId}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        ${this.getButtonText(type)}
                    </button>
                    <button class="btn-remove" data-id="${record.id}" data-listening-id="${record.listeningId}" data-type="${type}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        移除
                    </button>
                </div>
            </div>
        `;
    }

    // 获取显示标题，确保标题完整显示
    getDisplayTitle(record) {
        const baseTitle = record.listeningTitle || '未知听力';
        const listeningId = record.listeningId || '';
        
        // 检查标题是否已经包含套数信息
        if (baseTitle.includes('第') && baseTitle.includes('套')) {
            return baseTitle;
        }
        
        // 尝试从listeningId中提取套数信息
        const setNumberMatch = listeningId.match(/set(\d+)/i);
        if (setNumberMatch && setNumberMatch[1]) {
            const setNumber = setNumberMatch[1];
            return `${baseTitle} - 第 ${setNumber} 套`;
        }
        
        // 尝试从listeningId中提取其他数字信息
        const idParts = listeningId.split('-');
        if (idParts.length > 1) {
            // 检查是否有数字部分
            for (const part of idParts) {
                if (/^\d+$/.test(part)) {
                    // 如果标题中没有包含该数字，添加到标题中
                    if (!baseTitle.includes(part)) {
                        return `${baseTitle} - 第 ${part} 套`;
                    }
                }
            }
        }
        
        return baseTitle;
    }

    renderEmptyState(message, hint) {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19V6l12-3v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="15" r="3"/>
                    </svg>
                </div>
                <p class="empty-text">${message}</p>
                <p class="empty-hint">${hint}</p>
                <a href="index.html" class="empty-action">去学习</a>
            </div>
        `;
    }

    getFeedbackText(type, record) {
        if (type === 'unfamiliar') {
            return `陌生 · 待攻克 ${record.unfamiliar || 0} 句`;
        }
        if (type === 'familiar') {
            return `熟悉 · 已练习 ${record.familiar || 0} 次`;
        }
        return '听懂 · 已基本掌握';
    }

    getButtonText(type) {
        if (type === 'unfamiliar') {
            return '继续学习';
        }
        if (type === 'familiar') {
            return '再听一次';
        }
        return '复习一下';
    }

    setupTabSwitching() {
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.switchToTab(btn.dataset.tab);
            });
        });
    }

    switchToTab(tab) {
        this.currentTab = tab;

        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.querySelectorAll('.tab-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.id === `panel-${tab}`);
        });
    }

    setupStatisticsCards() {
        document.querySelectorAll('.stat-card').forEach((card) => {
            card.addEventListener('click', () => {
                const label = card.querySelector('.stat-label')?.textContent || '';
                const value = card.querySelector('.stat-value')?.textContent || '0';

                if (label.includes('未学') || label.includes('陌生')) {
                    ToastManager.info(`查看未学/陌生的 ${value} 条记录`);
                    this.switchToTab('unfamiliar');
                    return;
                }

                if (label.includes('熟悉')) {
                    ToastManager.info(`查看熟悉的 ${value} 条记录`);
                    this.switchToTab('familiar');
                    return;
                }

                if (label.includes('听懂')) {
                    ToastManager.info(`查看听懂的 ${value} 条记录`);
                    this.switchToTab('understood');
                    return;
                }

                ToastManager.info(`总音频数：${value}`);
            });
        });
    }

    setupAudioListItems() {
        document.querySelectorAll('.audio-item .btn-listen').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const listeningId = btn.dataset.listeningId;
                if (listeningId) {
                    window.location.href = `index.html?id=${encodeURIComponent(listeningId)}`;
                }
            });
        });

        document.querySelectorAll('.audio-item .btn-remove').forEach((btn) => {
            btn.addEventListener('click', async (event) => {
                event.stopPropagation();
                const recordId = btn.dataset.id;
                const listeningId = btn.dataset.listeningId;
                const type = btn.dataset.type;
                
                const confirmed = await DialogManager.confirm('确定要从学习记录中移除该听力材料吗？');
                if (confirmed) {
                    try {
                        // 模拟API调用移除学习记录
                        // 实际项目中应该调用相应的API
                        ToastManager.success('已从学习记录中移除');
                        
                        // 从本地记录中移除
                        this.records = this.records.filter(record => record.id !== recordId);
                        
                        // 存储已删除的记录ID到localStorage
                        this.saveRemovedRecord(recordId, listeningId);
                        
                        // 重新渲染列表
                        this.renderRecordLists();
                        
                        // 更新统计数据
                        const stats = {
                            totalUnfamiliar: this.records.filter(r => (r.unfamiliar || 0) > 0).length,
                            totalFamiliar: this.records.filter(r => (r.familiar || 0) > 0 && (r.understood || 0) === 0).length,
                            totalUnderstood: this.records.filter(r => (r.understood || 0) > 0).length
                        };
                        this.updateStatistics(stats);
                    } catch (error) {
                        console.error('Failed to remove learning record:', error);
                        ToastManager.error('移除失败，请稍后重试');
                    }
                }
            });
        });

        document.querySelectorAll('.audio-item').forEach((item) => {
            item.addEventListener('click', () => {
                const listeningId = item.dataset.listeningId;
                if (listeningId) {
                    window.location.href = `index.html?id=${encodeURIComponent(listeningId)}`;
                }
            });
        });
    }

    // 存储已删除的记录ID到localStorage
    saveRemovedRecord(recordId, listeningId) {
        const removedRecords = JSON.parse(localStorage.getItem('removedLearningRecords') || '[]');
        // 存储listeningId而不是recordId，这样在移除时就可以直接使用listeningId进行匹配
        if (!removedRecords.includes(listeningId)) {
            removedRecords.push(listeningId);
            localStorage.setItem('removedLearningRecords', JSON.stringify(removedRecords));
        }
    }

    // 获取已删除的记录ID列表
    getRemovedRecords() {
        return JSON.parse(localStorage.getItem('removedLearningRecords') || '[]');
    }

    // 过滤掉已删除的记录
    filterRemovedRecords(records) {
        const removedRecords = this.getRemovedRecords();
        return records.filter(record => {
            // 直接检查record.listeningId是否在已删除列表中
            return !removedRecords.includes(record.listeningId);
        });
    }
}

window.LearningRecordsController = LearningRecordsController;
