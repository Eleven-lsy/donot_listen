/*
 * Dynamic navigation renderer for sidebar.
 */

const IconSVG = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
};

async function loadNavigation() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/navigation`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.code === 0 && result.data) {
                return result.data;
            }
        }
    } catch (e) {
        console.warn('Failed to load navigation from API:', e);
    }
    return null;
}

function buildListeningItems(items, level, year) {
    if (!items || items.length === 0) return '';
    
    console.log('Building listening items:', { items, level, year });
    
    return items.map(item => {
        console.log('Processing item:', item);
        
        if (item.items && item.items.length > 0) {
            const firstListeningItem = item.items.find(child => child.id && !child.id.startsWith('set-'));
            const firstChildId = firstListeningItem?.id;
            
            console.log('First listening item:', firstListeningItem, 'ID:', firstChildId);
            
            if (!firstChildId) {
                console.warn('No valid listening item found for set:', item);
                return '';
            }
            
            const setNumber = item.setNumber || 1;
            const itemYear = firstListeningItem.year || year;
            const itemMonth = firstListeningItem.month;
            
            return `
                <div class="nav-subsection">
                    <a href="index.html?id=${firstChildId}&year=${itemYear}&level=${level}&setNumber=${setNumber}&month=${itemMonth}" class="nav-subsection-title">
                        <svg class="subsection-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                        <span>${item.label}</span>
                    </a>
                </div>
            `;
        } else {
            console.log('Direct item (no children):', item);
            return `
                <a href="index.html?id=${item.id}&year=${item.year || year}&level=${level}&setNumber=${item.setNumber || 1}&month=${item.month}" class="nav-item">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        ${IconSVG.calendar}
                    </svg>
                    <span>${item.label}</span>
                </a>
            `;
        }
    }).join('');
}

function buildMonthSection(cet4, cet6, year) {
    let html = '';
    
    if (cet4 && cet4.length > 0) {
        html += `
            <div class="nav-item-group">
                <span class="nav-item-group-label">4级</span>
                ${buildListeningItems(cet4, 4, year)}
            </div>
        `;
    }
    
    if (cet6 && cet6.length > 0) {
        html += `
            <div class="nav-item-group">
                <span class="nav-item-group-label">6级</span>
                ${buildListeningItems(cet6, 6, year)}
            </div>
        `;
    }
    
    return html;
}

function buildNavigationHTML(navData) {
    if (!navData) {
        return '<div class="nav-section"><div class="nav-section-title">加载中...</div></div>';
    }
    
    let yearsHTML = navData.years?.map(yearSection => `
        <div class="nav-section" data-section-id="${yearSection.id}">
            <div class="nav-section-title collapsible">
                <span>${yearSection.title}</span>
                <svg class="chevron-icon collapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
            <div class="nav-section-items collapsed">
                ${yearSection.months?.map(month => `
                    <div class="nav-subsection">
                        <div class="nav-subsection-title">
                            <svg class="subsection-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                            <span>${month.title}</span>
                        </div>
                        <div class="nav-subsection-items">
                            ${buildMonthSection(month.cet4, month.cet6, yearSection.title.replace('年', ''))}
                        </div>
                    </div>
                `).join('') || ''}
            </div>
        </div>
    `).join('') || '';
    
    let specialHTML = navData.special?.map(section => `
        <div class="nav-section" data-section-id="${section.id}">
            <div class="nav-section-title collapsible">
                <span>${section.title}</span>
                <svg class="chevron-icon collapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
            <div class="nav-section-items collapsed">
                <div class="nav-subsection-items">
                    ${section.items?.map(item => {
                        const itemYear = item.year || 2024;
                        const itemLevel = item.level || 4;
                        const itemMonth = item.month || 12;
                        return `
                        <a href="index.html?id=${item.id}&level=${itemLevel}&type=${item.type}" class="nav-item">
                            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                ${IconSVG.activity}
                            </svg>
                            <span>${item.label}</span>
                        </a>
                    `}).join('') || ''}
                </div>
            </div>
        </div>
    `).join('') || '';
    
    const personalHTML = `
        <div class="nav-section">
            <div class="nav-section-title">个人中心</div>
            <div class="nav-section-items">
                <a href="learning-records.html" class="nav-item" data-nav-id="learning-records">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        ${IconSVG.user}
                    </svg>
                    <span>学习记录</span>
                </a>
                <a href="favorites.html" class="nav-item" data-nav-id="favorites">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        ${IconSVG.bookmark}
                    </svg>
                    <span>收藏夹</span>
                </a>
                <a href="settings.html" class="nav-item" data-nav-id="settings">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        ${IconSVG.settings}
                    </svg>
                    <span>设置</span>
                </a>
            </div>
        </div>
    `;
    
    const supportHTML = `
        <div class="nav-section">
            <a href="javascript:void(0)" class="nav-item support" data-action="support">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    ${IconSVG.heart}
                </svg>
                <span>支持作者</span>
            </a>
        </div>
    `;
    
    return yearsHTML + specialHTML + personalHTML + supportHTML;
}

function initNavigation() {
    return new Promise((resolve) => {
        const navContainer = document.getElementById('sidebarNav');
        if (!navContainer) {
            resolve();
            return;
        }
        
        navContainer.innerHTML = '<div class="nav-section"><div class="nav-section-title">加载中...</div></div>';
        
        loadNavigation().then(navData => {
            navContainer.innerHTML = buildNavigationHTML(navData);
            initEventListeners();
            resolve();
        });
    });
}

function initEventListeners() {
    const navContainer = document.getElementById('sidebarNav');
    if (!navContainer) return;
    
    navContainer.addEventListener('click', (e) => {
        const section = e.target.closest('.nav-section-title.collapsible');
        if (section) {
            const items = section.nextElementSibling;
            const chevron = section.querySelector('.chevron-icon');
            if (items?.classList.contains('collapsed')) {
                items.classList.remove('collapsed');
                chevron?.classList.remove('collapsed');
            } else {
                items?.classList.add('collapsed');
                chevron?.classList.add('collapsed');
            }
        }
    });
}

document.addEventListener('click', (e) => {
    const section = e.target.closest('.nav-section-title.collapsible');
    if (section) {
        const items = section.nextElementSibling;
        const chevron = section.querySelector('.chevron-icon');
        if (items?.classList.contains('collapsed')) {
            items.classList.remove('collapsed');
            chevron?.classList.remove('collapsed');
        } else {
            items?.classList.add('collapsed');
            chevron?.classList.add('collapsed');
        }
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

