/**
 * 标签分类页面专用脚本
 * 负责标签筛选、文章和项目过滤等交互功能
 */

(function() {
    'use strict';
    
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        const filterContainer = document.querySelector('.tag-filter') || document.getElementById('tagFilter');
        const articlesGrid = document.getElementById('articlesGrid') || document.querySelector('.articles-container');
        
        if (!filterContainer || !articlesGrid) return;
        
        // 委托事件处理点击筛选
        filterContainer.addEventListener('click', function(e) {
            const target = e.target.closest('.filter-btn');
            if (!target) return;
            
            e.preventDefault();
            
            // 更新激活状态
            const allButtons = filterContainer.querySelectorAll('.filter-btn');
            allButtons.forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            
            // 获取筛选标签
            const filterValue = target.getAttribute('data-filter');
            
            // 筛选内容
            filterContent(filterValue, articlesGrid);
            
            // 更新URL hash
            updateURLHash(filterValue);
        });
        
        // 标签云点击事件代理
        const tagCloud = document.querySelector('.tag-cloud');
        if (tagCloud) {
            tagCloud.addEventListener('click', function(e) {
                const target = e.target.closest('.tag-cloud-item');
                if (!target) return;
                
                e.preventDefault();
                const tag = target.dataset.tag;
                
                // 找到对应的筛选按钮并触发点击
                const filterContainer = document.querySelector('.tag-filter') || document.getElementById('tagFilter');
                const targetButton = Array.from(filterContainer.querySelectorAll('.filter-btn'))
                    .find(btn => btn.dataset.filter === tag);
                
                if (targetButton) {
                    targetButton.click();
                }
            });
        }
        
        // 支持 URL hash 直接定位到某个标签（优先处理）
        if (window.location.hash) {
            const hash = window.location.hash.slice(1); // 移除 #
            
            // 支持两种格式：#tag-xxx 或直接 #xxx
            let tagSlug = hash;
            if (hash.startsWith('tag-')) {
                tagSlug = hash.replace('tag-', '');
            } else if (hash.startsWith('tags/')) {
                // 如果是从 /tags/xxx 跳转过来（虽然不会真的跳转，但以防万一）
                tagSlug = hash.replace('tags/', '');
            }
            
            // 找到对应的筛选按钮并触发点击
            const targetButton = Array.from(filterContainer.querySelectorAll('.filter-btn'))
                .find(btn => btn.getAttribute('data-filter') === tagSlug);
            
            if (targetButton) {
                // 延迟执行，确保 DOM 完全渲染
                setTimeout(() => {
                    targetButton.click();
                    // 平滑滚动到内容区域
                    articlesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
        
        // 从全局数据加载统计（如果可用）
        if (typeof window.tagsData !== 'undefined') {
            updateTagStats(window.tagsData.tags, window.tagsData.articles);
        }
    }
    
    function filterContent(filterValue, grid) {
        const cards = Array.from(grid.querySelectorAll('[data-tags]'));
        
        if (filterValue === 'all') {
            // 显示所有内容
            cards.forEach(card => {
                card.style.display = '';
                // 添加淡入动画
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.3s ease';
                    card.style.opacity = '1';
                }, 50);
            });
        } else {
            // 筛选特定标签
            cards.forEach(card => {
                const tagsAttr = card.getAttribute('data-tags');
                const hasTag = tagsAttr && tagsAttr.split(',').includes(filterValue);
                
                if (hasTag) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.3s ease';
                        card.style.opacity = '1';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    // 更新URL hash
    function updateURLHash(tag) {
        if (tag === 'all') {
            history.pushState(null, null, ' ');
        } else {
            history.pushState(null, null, `#tag-${tag}`);
        }
    }
    
    // 更新统计数据
    function updateTagStats(tags, articles) {
        const totalTagsEl = document.getElementById('totalTags');
        const totalArticlesWithTagEl = document.getElementById('totalArticlesWithTag');
        const avgTagsPerArticleEl = document.getElementById('avgTagsPerArticle');
        
        if (!totalTagsEl || !totalArticlesWithTagEl || !avgTagsPerArticleEl) {
            return;
        }
        
        // 计算统计数据
        const totalTags = tags.length;
        const articlesWithTag = articles.filter(article => article.tags && article.tags.length > 0).length;
        const totalTagCount = articles.reduce((sum, article) => sum + (article.tags ? article.tags.length : 0), 0);
        const avgTags = articlesWithTag > 0 ? (totalTagCount / articlesWithTag).toFixed(1) : 0;
        
        // 更新显示
        animateNumber(totalTagsEl, parseInt(totalTagsEl.textContent) || 0, totalTags);
        animateNumber(totalArticlesWithTagEl, parseInt(totalArticlesWithTagEl.textContent) || 0, articlesWithTag);
        animateNumber(avgTagsPerArticleEl, parseFloat(avgTagsPerArticleEl.textContent) || 0, parseFloat(avgTags));
    }
    
    // 数字滚动动画
    function animateNumber(element, start, end) {
        if (start === end) return;
        
        const duration = 1000;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数使动画更流畅
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const isFloat = typeof end === 'number' && !Number.isInteger(end);
            const current = isFloat 
                ? (start + (end - start) * easeOutQuart).toFixed(1)
                : Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end;
            }
        }
        
        requestAnimationFrame(update);
    }
})();
