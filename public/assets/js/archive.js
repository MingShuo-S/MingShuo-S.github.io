// 时间线归档页面交互脚本

document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动到指定年份（如果 URL 包含 hash）
    if (window.location.hash) {
        const targetYear = document.querySelector(window.location.hash);
        if (targetYear) {
            setTimeout(() => {
                targetYear.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }
    
    // 为每个年份添加 ID，方便跳转
    const yearElements = document.querySelectorAll('.year-title');
    yearElements.forEach((yearEl, index) => {
        const yearText = yearEl.textContent.trim();
        const yearId = `year-${yearText.replace('年', '')}`;
        yearEl.parentElement.setAttribute('id', yearId);
    });
    
    // 点击月份标题高亮效果
    const monthTitles = document.querySelectorAll('.month-title');
    monthTitles.forEach(title => {
        title.addEventListener('click', function() {
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    
    // 时间线索引项的点击动画
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.tagName !== 'A') {
                const link = this.querySelector('.article-link');
                if (link) {
                    // 添加点击反馈
                    this.style.opacity = '0.7';
                    setTimeout(() => {
                        this.style.opacity = '';
                    }, 150);
                }
            }
        });
    });
    
    // 滚动时显示/隐藏返回顶部按钮
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backBtn.style.opacity = '1';
                backBtn.style.transform = 'translateY(0)';
            } else {
                backBtn.style.opacity = '0';
                backBtn.style.transform = 'translateY(20px)';
            }
        });
        
        // 初始隐藏
        backBtn.style.transition = 'all 0.3s ease';
        backBtn.style.opacity = '0';
        backBtn.style.transform = 'translateY(20px)';
    }
    
    // 点击返回顶部
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // 为文章卡片添加进入动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 初始化所有时间线索引项的样式
    const timelineItemsArray = document.querySelectorAll('.timeline-item');
    timelineItemsArray.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `all 0.5s ease ${index * 0.05}s`;
        observer.observe(item);
    });
    
    console.log('📅 归档页面交互已加载');
});
