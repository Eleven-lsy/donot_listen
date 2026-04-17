/*
 * Controls the favorites page and collection interactions.
 */

class FavoritesController {
    constructor() {
        this.favorites = [];
        this.lineFavorites = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        this.setupFilterTabs();
        this.loadLineFavorites();
        await this.loadFavorites();
    }

    getCurrentUserId() {
        return authService?.getUser?.()?.id || App?.getUser?.()?.id || null;
    }

    loadLineFavorites() {
        const userId = this.getCurrentUserId();
        const favorites = JSON.parse(localStorage.getItem('lineFavorites') || '[]');
        this.lineFavorites = favorites
            .filter((item) => {
                if (item.userId == null) {
                    return true;
                }
                return userId != null && item.userId === userId;
            })
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    async loadFavorites() {
        const listContainer = document.getElementById('favoritesList');

        try {
            const response = await LoadingManager.withLoading(
                userService.getCollections(),
                { loadingText: '加载收藏列表...' }
            );

            this.favorites = response?.data?.list || [];
            this.renderFavorites(this.favorites);
        } catch (error) {
            console.error('Failed to load favorites:', error);

            if (error.code === 401) {
                ToastManager.error('请先登录');
                return;
            }

            if (listContainer) {
                listContainer.innerHTML = this.renderEmptyState('加载收藏失败');
            }
            ToastManager.error('加载收藏失败');
        }
    }

    renderFavorites(favorites) {
        const listContainer = document.getElementById('favoritesList');
        if (!listContainer) {
            return;
        }

        const filtered = this.filterFavorites(favorites || []);
        const sentenceFavorites = this.currentFilter === 'all' ? this.lineFavorites : [];

        if (!filtered.length && !sentenceFavorites.length) {
            listContainer.innerHTML = this.renderEmptyState(this.currentFilter === 'all' ? '暂无收藏内容' : '暂无符合条件的收藏');
            return;
        }

        const sections = [];
        if (sentenceFavorites.length) {
            sections.push(this.renderLineFavoritesSection(sentenceFavorites));
        }
        if (filtered.length) {
            sections.push(this.renderListeningFavoritesSection(filtered));
        }

        listContainer.innerHTML = sections.join('');
        this.setupFavoriteCards();
    }

    renderLineFavoritesSection(favorites) {
        return `
            <section class="favorites-section">
                <div class="favorites-section-header">
                    <h2 class="favorites-section-title">单句收藏</h2>
                    <span class="favorites-section-count">${favorites.length} 句</span>
                </div>
                <div class="sentence-favorites-list">
                    ${favorites.map((item) => this.renderLineFavoriteCard(item)).join('')}
                </div>
            </section>
        `;
    }

    renderListeningFavoritesSection(favorites) {
        return `
            <section class="favorites-section">
                <div class="favorites-section-header">
                    <h2 class="favorites-section-title">听力收藏</h2>
                    <span class="favorites-section-count">${favorites.length} 篇</span>
                </div>
                <div class="listening-favorites-list">
                    ${favorites.map((item) => this.renderFavoriteCard(item)).join('')}
                </div>
            </section>
        `;
    }

    renderLineFavoriteCard(item) {
        const createdAt = this.formatDate(item.createdAt);
        const lineLabel = item.lineNumber ? `第 ${item.lineNumber} 句` : '已收藏单句';
        const title = item.listeningTitle || item.listeningId || '未命名听力';
        const text = this.escapeHtml(item.text || '该句内容暂不可用');

        return `
            <article class="sentence-favorite-card" data-line-number="${item.lineNumber}" data-listening-id="${item.listeningId}">
                <div class="sentence-favorite-main">
                    <div class="sentence-favorite-tags">
                        <span class="source-tag">${this.escapeHtml(title)}</span>
                        <span class="source-tag">${lineLabel}</span>
                        <span class="source-tag">${createdAt}</span>
                    </div>
                    <p class="sentence-favorite-text">${text}</p>
                </div>
                <div class="sentence-favorite-actions">
                    <button class="play-btn line-play-btn" data-listening-id="${item.listeningId}" title="打开原听力">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                    </button>
                    <button class="remove-btn line-remove-btn" data-listening-id="${item.listeningId}" data-line-number="${item.lineNumber}" title="取消收藏">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </article>
        `;
    }

    renderFavoriteCard(item) {
        const levelText = item.level === 6 ? '六级' : '四级';
        const duration = this.formatDuration(item.duration);
        const collectedAt = this.formatDate(item.collectedAt);
        const fallbackCover = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyI+6Iux5a2mPC90ZXh0Pjwvc3ZnPg==';

        // 优先使用服务器返回的完整标题（如果有的话）
        let displayTitle = item.title || item.listeningTitle || '未知听力';
        
        // 如果标题不包含套数信息，尝试从其他地方提取
        if (!displayTitle.includes(' - 第 ') && !displayTitle.includes('套')) {
            let setNumber = null;
            
            // 1. 首先检查item中是否有setNumber字段
            if (item.setNumber && item.setNumber > 1) {
                setNumber = item.setNumber;
            }
            // 2. 尝试从listeningId中提取setNumber
            else {
                const listeningId = item.listeningId || item.id;
                if (listeningId) {
                    // 尝试多种格式的匹配
                    const idMatch1 = listeningId.match(/set(\d+)/);
                    const idMatch2 = listeningId.match(/第(\d+)套/);
                    const idMatch3 = listeningId.match(/(\d+)\s*套/);
                    
                    if (idMatch1 && parseInt(idMatch1[1]) > 1) {
                        setNumber = parseInt(idMatch1[1]);
                    } else if (idMatch2 && parseInt(idMatch2[1]) > 1) {
                        setNumber = parseInt(idMatch2[1]);
                    } else if (idMatch3 && parseInt(idMatch3[1]) > 1) {
                        setNumber = parseInt(idMatch3[1]);
                    }
                }
            }
            
            // 如果找到了setNumber且大于1，添加到标题中
            if (setNumber && setNumber > 1) {
                displayTitle = `${displayTitle} - 第 ${setNumber} 套`;
            }
        }

        return `
            <div class="favorite-card" data-id="${item.id}" data-listening-id="${item.listeningId}" data-type="${item.type || 'dialogue'}">
                <div class="favorite-cover">
                    <img src="${item.coverImage || fallbackCover}" alt="${this.escapeHtml(displayTitle)}" onerror="this.src='${fallbackCover}'">
                </div>
                <div class="favorite-info">
                    <h3 class="favorite-title">${this.escapeHtml(displayTitle)}</h3>
                    <div class="favorite-meta">
                        <span class="level-tag">${levelText}</span>
                        <span class="duration-text">${duration}</span>
                        <span class="collect-time">收藏于 ${collectedAt}</span>
                    </div>
                </div>
                <div class="favorite-actions">
                    <button class="play-btn" data-listening-id="${item.listeningId}" title="开始学习">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                    </button>
                    <button class="remove-btn" data-listening-id="${item.listeningId}" title="取消收藏">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyState(message = '暂无收藏内容') {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <p class="empty-text">${message}</p>
                <p class="empty-hint">开始学习听力，把喜欢的内容收藏到这里。</p>
                <a href="index.html" class="empty-action">去学习</a>
            </div>
        `;
    }

    filterFavorites(favorites) {
        if (this.currentFilter === 'all') {
            return favorites;
        }

        return favorites.filter((item) => {
            // 获取材料类型，如果没有type属性，则根据标题推断
            const itemType = item.type || this.inferTypeFromTitle(item.listeningTitle || item.title || '');
            return itemType === this.currentFilter;
        });
    }

    // 根据标题推断材料类型
    inferTypeFromTitle(title) {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('新闻') || lowerTitle.includes('news')) {
            return 'lecture';
        } else if (lowerTitle.includes('对话') || lowerTitle.includes('dialogue')) {
            return 'dialogue';
        } else if (lowerTitle.includes('短文') || lowerTitle.includes('passage') || lowerTitle.includes('article')) {
            return 'passage';
        } else {
            return 'dialogue'; // 默认类型
        }
    }

    setupFilterTabs() {
        document.querySelectorAll('.filter-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach((item) => item.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.renderFavorites(this.favorites);
            });
        });
    }

    setupFavoriteCards() {
        document.querySelectorAll('.favorite-card .play-btn, .sentence-favorite-card .line-play-btn').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const listeningId = btn.dataset.listeningId;
                const lineNumber = Number.parseInt(btn.dataset.lineNumber, 10);
                if (listeningId) {
                    window.location.href = this.buildPlayerUrl(listeningId, lineNumber);
                }
            });
        });

        document.querySelectorAll('.favorite-card .remove-btn').forEach((btn) => {
            btn.addEventListener('click', async (event) => {
                event.stopPropagation();

                const listeningId = btn.dataset.listeningId;
                const card = btn.closest('.favorite-card');
                const confirmed = await DialogManager.confirm('确定要取消收藏吗？');

                if (!confirmed || !listeningId || !card) {
                    return;
                }

                try {
                    await LoadingManager.withLoading(
                        userService.removeCollection(listeningId),
                        { loadingText: '取消收藏...' }
                    );

                    card.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        card.remove();
                        this.favorites = this.favorites.filter((item) => item.listeningId !== listeningId);
                        this.renderFavorites(this.favorites);
                        ToastManager.success('已取消收藏');
                    }, 300);
                } catch (error) {
                    console.error('Failed to remove collection:', error);
                    ToastManager.error('取消收藏失败');
                }
            });
        });

        document.querySelectorAll('.sentence-favorite-card .line-remove-btn').forEach((btn) => {
            btn.addEventListener('click', async (event) => {
                event.stopPropagation();

                const listeningId = btn.dataset.listeningId;
                const lineNumber = Number.parseInt(btn.dataset.lineNumber, 10);
                const card = btn.closest('.sentence-favorite-card');
                const confirmed = await DialogManager.confirm('确定要取消这句收藏吗？');

                if (!confirmed || !listeningId || !lineNumber || !card) {
                    return;
                }

                this.removeLineFavorite(listeningId, lineNumber);
                card.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    card.remove();
                    this.renderFavorites(this.favorites);
                    ToastManager.success('已取消单句收藏');
                }, 300);
            });
        });

        document.querySelectorAll('.favorite-card, .sentence-favorite-card').forEach((card) => {
            card.addEventListener('click', () => {
                const listeningId = card.dataset.listeningId;
                const lineNumber = Number.parseInt(card.dataset.lineNumber, 10);
                if (listeningId) {
                    window.location.href = this.buildPlayerUrl(listeningId, lineNumber);
                }
            });
        });
    }

    buildPlayerUrl(listeningId, lineNumber) {
        const params = new URLSearchParams({ id: listeningId });
        if (!Number.isNaN(lineNumber) && lineNumber > 0) {
            params.set('line', String(lineNumber));
        }
        return `index.html?${params.toString()}`;
    }

    removeLineFavorite(listeningId, lineNumber) {
        const userId = this.getCurrentUserId();
        const favorites = JSON.parse(localStorage.getItem('lineFavorites') || '[]');
        const nextFavorites = favorites.filter((item) => !(
            item.listeningId === listeningId
            && item.lineNumber === lineNumber
            && ((item.userId ?? null) === userId || item.userId == null)
        ));
        localStorage.setItem('lineFavorites', JSON.stringify(nextFavorites));
        this.loadLineFavorites();
    }

    formatDuration(seconds) {
        if (!seconds) {
            return '0 分钟';
        }

        const minutes = Math.max(1, Math.round(seconds / 60));
        return `${minutes} 分钟`;
    }

    formatDate(dateString) {
        if (!dateString) {
            return '未知时间';
        }

        try {
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) {
                return '未知时间';
            }
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        } catch (error) {
            return '未知时间';
        }
    }

    escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }
}

window.FavoritesController = FavoritesController;
