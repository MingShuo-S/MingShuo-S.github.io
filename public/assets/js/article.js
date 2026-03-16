// 文章页面专用脚本
document.addEventListener('DOMContentLoaded', function() {
    // ===== 目录生成 =====
    generateTableOfContents();
    
    // ===== 目录折叠/展开 =====
    setupTocToggle();
    
    // ===== 目录跟随高亮 =====
    setupTocHighlight();
    
    // ===== 分享功能 =====
    setupShareButtons();
    
    // ===== 阅读进度 =====
    setupReadingProgress();
    
    // ===== 代码块复制 =====
    setupCodeCopyButtons();
    
    // ===== 图片灯箱 =====
    setupImageLightbox();
});

// 生成文章目录
function generateTableOfContents() {
    const articleContent = document.getElementById('articleContent');
    const tocContent = document.getElementById('tocContent');
    
    if (!articleContent || !tocContent) return;
    
    // 获取所有标题
    const headings = articleContent.querySelectorAll('h1, h2, h3');
    if (headings.length === 0) {
        tocContent.innerHTML = '<p style="color: var(--text-light); font-size: 0.875rem; margin: 0;">本文无目录结构</p>';
        return;
    }
    
    // 创建目录结构
    let tocHTML = '<ul>';
    let currentH1 = null;
    let currentH2 = null;
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const id = heading.id || `heading-${index}`;
        const text = heading.textContent;
        
        // 如果没有ID，创建一个
        if (!heading.id) {
            heading.id = id;
        }
        
        // 根据标题级别创建结构
        switch(level) {
            case 1:
                tocHTML += `
                    <li>
                        <a href="#${id}" data-level="h1">${text}</a>
                    </li>`;
                currentH1 = id;
                currentH2 = null;
                break;
                
            case 2:
                tocHTML += `
                    <li>
                        <a href="#${id}" data-level="h2">${text}</a>`;
                currentH2 = id;
                break;
                
            case 3:
                if (currentH2) {
                    // 如果有h2，添加到h2的子列表中
                    tocHTML += `<ul><li><a href="#${id}" data-level="h3">${text}</a></li></ul>`;
                } else if (currentH1) {
                    // 如果只有h1，添加到h1的子列表中
                    tocHTML += `<ul><li><a href="#${id}" data-level="h3">${text}</a></li></ul>`;
                } else {
                    // 直接添加到根
                    tocHTML += `<li><a href="#${id}" data-level="h3">${text}</a></li>`;
                }
                break;
        }
        
        if (level === 2) {
            tocHTML += '</li>';
        }
    });
    
    tocHTML += '</ul>';
    tocContent.innerHTML = tocHTML;
    
    // 平滑滚动
    tocContent.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 计算偏移量（考虑固定导航栏）
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - navHeight - 20;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // 添加高亮效果
                targetElement.classList.add('highlight');
                setTimeout(() => {
                    targetElement.classList.remove('highlight');
                }, 2000);
                
                // 如果是移动端，点击后收起目录
                if (window.innerWidth < 1024) {
                    const tocToggle = document.getElementById('tocToggle');
                    const tocContent = document.getElementById('tocContent');
                    if (tocContent && !tocContent.classList.contains('collapsed')) {
                        toggleToc();
                    }
                }
            }
        });
    });
}

// 设置目录折叠/展开
function setupTocToggle() {
    const tocToggle = document.getElementById('tocToggle');
    const tocContent = document.getElementById('tocContent');
    
    if (!tocToggle || !tocContent) return;
    
    // 检查是否已保存折叠状态
    const isCollapsed = localStorage.getItem('tocCollapsed') === 'true';
    
    if (isCollapsed) {
        tocContent.classList.add('collapsed');
        tocToggle.classList.add('collapsed');
    }
    
    tocToggle.addEventListener('click', toggleToc);
    
    function toggleToc() {
        tocContent.classList.toggle('collapsed');
        tocToggle.classList.toggle('collapsed');
        
        // 保存状态
        localStorage.setItem('tocCollapsed', tocContent.classList.contains('collapsed'));
    }
}

// 设置目录跟随高亮
function setupTocHighlight() {
    const tocLinks = document.querySelectorAll('.toc-content a');
    if (tocLinks.length === 0) return;
    
    const sections = [];
    tocLinks.forEach(link => {
        const id = link.getAttribute('href').substring(1);
        const section = document.getElementById(id);
        if (section) {
            sections.push({ id, element: section, link });
        }
    });
    
    if (sections.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.id;
                // 移除所有活跃状态
                tocLinks.forEach(link => link.classList.remove('active'));
                // 添加当前活跃状态
                const activeLink = document.querySelector(`.toc-content a[href="#${activeId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    
                    // 滚动到可见区域
                    const tocContent = document.getElementById('tocContent');
                    if (tocContent && !tocContent.classList.contains('collapsed')) {
                        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section.element);
    });
}

// 设置分享按钮
function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const currentUrl = window.location.href;
            const title = document.title;
            
            if (platform === 'copy-link') {
                copyToClipboard(currentUrl);
                showToast('链接已复制到剪贴板！');
                return;
            }
            
            let shareUrl = '';
            
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;
                    break;
                case 'weibo':
                    shareUrl = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;
                    break;
                default:
                    return;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('复制成功:', text);
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

// 显示提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out;
        font-size: 0.875rem;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// 阅读进度
function setupReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background-color: var(--primary-color);
        z-index: 9998;
        transition: width 0.1s;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', updateProgressBar);
    
    function updateProgressBar() {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight - winHeight;
        const scrolled = (window.scrollY / docHeight) * 100;
        
        progressBar.style.width = scrolled + '%';
    }
    
    // 初始更新
    updateProgressBar();
}

// 代码块复制按钮
function setupCodeCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
        // 检查是否已经有复制按钮
        if (pre.querySelector('.copy-code-btn')) return;
        
        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = '复制代码';
        copyButton.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #e6e6e6;
            padding: 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            z-index: 2;
            font-size: 0.875rem;
        `;
        
        copyButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        copyButton.addEventListener('click', function() {
            const code = pre.querySelector('code').textContent;
            copyToClipboard(code);
            
            // 显示复制成功反馈
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.color = '#4caf50';
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.color = '#e6e6e6';
            }, 2000);
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
}

// 图片灯箱
function setupImageLightbox() {
    document.querySelectorAll('.article-content img').forEach(img => {
        if (img.closest('pre') || img.closest('.mermaid')) return;
        
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function() {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                cursor: zoom-out;
            `;
            
            const lightboxImg = document.createElement('img');
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightboxImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 4px;
            `;
            
            lightbox.appendChild(lightboxImg);
            document.body.appendChild(lightbox);
            
            // 点击关闭
            lightbox.addEventListener('click', function(e) {
                if (e.target === this || e.target === lightboxImg) {
                    this.remove();
                }
            });
            
            // ESC键关闭
            document.addEventListener('keydown', function closeOnEsc(e) {
                if (e.key === 'Escape') {
                    lightbox.remove();
                    document.removeEventListener('keydown', closeOnEsc);
                }
            });
        });
    });
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        85% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
    
    .highlight {
        animation: highlight 2s ease;
    }
    
    @keyframes highlight {
        0% { background-color: rgba(var(--primary-color-rgb), 0.2); }
        100% { background-color: transparent; }
    }
    
    .copy-code-btn:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
    }
`;

document.head.appendChild(style);