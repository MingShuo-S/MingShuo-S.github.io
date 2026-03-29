// ===== 分类归档页面交互脚本 =====

document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动到分类
    document.querySelectorAll('.category-stat-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 高亮显示分类
                highlightCategory(targetElement);
            }
        });
    });
    
    // 监听滚动，自动更新 URL
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(function() {
            const categories = document.querySelectorAll('.category-group');
            let currentCategory = '';
            
            categories.forEach(category => {
                const rect = category.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    currentCategory = category.id;
                }
            });
            
            if (currentCategory) {
                const categoryName = decodeURIComponent(currentCategory.replace('category-', ''));
                history.pushState(null, null, `#${currentCategory}`);
                updateActiveStat(categoryName);
            }
        }, 100);
    });
    
    // 返回顶部按钮
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

/**
 * 高亮显示分类
 */
function highlightCategory(element) {
    // 移除其他分类的高亮
    document.querySelectorAll('.category-group').forEach(cat => {
        cat.style.transition = 'all 0.3s ease';
        cat.style.transform = 'none';
        cat.style.boxShadow = 'none';
    });
    
    // 添加当前分类高亮
    element.style.transform = 'scale(1.02)';
    element.style.boxShadow = '0 8px 24px rgba(74, 108, 247, 0.2)';
    
    // 3 秒后恢复
    setTimeout(() => {
        element.style.transform = 'none';
        element.style.boxShadow = 'none';
    }, 2000);
}

/**
 * 更新活跃的分类统计项
 */
function updateActiveStat(categoryName) {
    document.querySelectorAll('.category-stat-link').forEach(link => {
        link.style.border = '1px solid var(--border-color)';
        link.style.background = 'var(--bg-primary)';
        
        const nameElement = link.querySelector('.category-name');
        if (nameElement && nameElement.textContent === categoryName) {
            link.style.border = '2px solid var(--primary-color)';
            link.style.background = 'linear-gradient(135deg, rgba(74, 108, 247, 0.1), rgba(13, 110, 253, 0.1))';
        }
    });
}
