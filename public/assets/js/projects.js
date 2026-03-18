/**
 * 项目展示页面专用脚本
 * 负责项目筛选、统计更新等交互功能
 */

// 项目筛选功能
function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card:not(.no-projects)');
    
    if (filterBtns.length === 0 || projectCards.length === 0) {
        return;
    }
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有激活状态
            filterBtns.forEach(b => b.classList.remove('active'));
            // 添加当前激活状态
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// 更新统计数据
function updateProjectStats(projects) {
    const totalProjectsEl = document.getElementById('totalProjects');
    const totalStarsEl = document.getElementById('totalStars');
    const languagesCountEl = document.getElementById('languagesCount');
    
    if (!totalProjectsEl || !totalStarsEl || !languagesCountEl) {
        return;
    }
    
    // 计算统计数据
    const totalProjects = projects.length;
    const totalStars = projects.reduce((sum, project) => sum + (project.stars || 0), 0);
    const languages = [...new Set(projects.map(p => p.language).filter(Boolean))];
    const languagesCount = languages.length;
    
    // 更新显示（添加数字滚动效果）
    animateNumber(totalProjectsEl, parseInt(totalProjectsEl.textContent) || 0, totalProjects);
    animateNumber(totalStarsEl, parseInt(totalStarsEl.textContent) || 0, totalStars);
    animateNumber(languagesCountEl, parseInt(languagesCountEl.textContent) || 0, languagesCount);
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
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(update);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化筛选功能
    initProjectFilter();
    
    // 从全局数据加载统计（如果可用）
    if (typeof window.projectsData !== 'undefined') {
        updateProjectStats(window.projectsData);
    }
});
