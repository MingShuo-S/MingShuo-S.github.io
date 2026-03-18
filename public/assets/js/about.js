/**
 * About 页面专用 JavaScript
 * 处理关于页面的特殊交互功能
 */

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('About page loaded');
    
    // 初始化技能卡片动画
    initSkillCards();
    
    // 初始化时间轴动画
    initTimelineAnimation();
});

/**
 * 初始化技能卡片悬停效果增强
 */
function initSkillCards() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 可以在这里添加更多交互逻辑
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            // 恢复样式
        });
    });
}

/**
 * 初始化时间轴动画
 */
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // 使用 Intersection Observer 实现滚动动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
}

/**
 * 平滑滚动到指定锚点
 */
function smoothScrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * 更新最后更新时间
 */
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        lastUpdatedElement.textContent = formattedDate;
    }
}

// 页面加载完成后更新最后更新时间
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLastUpdated);
} else {
    updateLastUpdated();
}
