// 文章页面专用脚本
document.addEventListener('DOMContentLoaded', function() {
    // ===== 目录生成 =====
    generateTableOfContents();
    
    // ===== 目录切换功能 =====
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
                        <a href="#${id}" data-level="h2">${text}</a>
                    </li>`;
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
                // 仅在桌面端（>1024px）启用平滑滚动，避免移动端强制滚动影响用户体验
                if (window.innerWidth > 1024) {
                    const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - navHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // 添加高亮效果
                targetElement.classList.add('highlight');
                setTimeout(() => {
                    targetElement.classList.remove('highlight');
                }, 2000);
                
                // 如果是移动端，点击后收起目录
                if (window.innerWidth < 1024) {
                    const tocContainer = document.querySelector('.article-toc');
                    const tocContent = document.getElementById('tocContent');
                    // 检查目录当前是否为展开状态（未包含'collapsed'类），若是则调用收起操作
                    if (tocContainer && !tocContainer.classList.contains('collapsed')) {
                        tocContainer.classList.add('collapsed');
                        if (tocContent) {
                            tocContent.style.display = 'none';
                        }
                    }
                }
            }
        });
    });
}

// 设置目录切换功能
function setupTocToggle() {
    const tocToggle = document.getElementById('tocToggle');
    const tocContainer = document.querySelector('.article-toc');
    const tocContent = document.getElementById('tocContent');
    
    if (!tocToggle || !tocContainer || !tocContent) return;
    
    // ✅ 性能优化：使用防抖处理 resize 事件
    let resizeTimer;
    
    // 点击按钮切换
    tocToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        toggleToc();
    });
    
    // 桌面端：点击整个收起的目录区域也可以展开
    tocContainer.addEventListener('click', function(e) {
        if (window.innerWidth > 1024 && this.classList.contains('collapsed')) {
            e.stopPropagation();
            toggleToc();
        }
    });
    
    // 切换函数
    function toggleToc() {
        // 切换收起状态
        tocContainer.classList.toggle('collapsed');
        
        // 更新按钮状态
        const isCollapsed = tocContainer.classList.contains('collapsed');
        tocToggle.setAttribute('aria-expanded', !isCollapsed);
        
        // 更新图标 - 使用类名切换实现平滑旋转
        const icon = tocToggle.querySelector('i');
        if (icon) {
            if (window.innerWidth > 1024) {
                // 桌面端：收起时图标向右，展开时图标向左
                // 通过移除旧类名、添加新类名实现切换
                icon.classList.remove('fa-chevron-left', 'fa-chevron-right');
                icon.classList.add(isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left');
            } else {
                // 移动端：收起时图标向下，展开时图标向上
                icon.classList.remove('fa-chevron-up', 'fa-chevron-down');
                icon.classList.add(isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up');
            }
        }
        
        // 桌面端不需要手动控制 display，由 CSS 处理
        // 移动端才需要手动控制 display
        if (window.innerWidth <= 1024) {
            if (isCollapsed) {
                tocContent.style.display = 'none';
            } else {
                tocContent.style.display = 'block';
            }
        }
    }
    
    // 监听窗口大小变化，调整图标方向和显示逻辑
    window.addEventListener('resize', function() {
        // ✅ 防抖处理：延迟执行，避免频繁触发
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const icon = tocToggle.querySelector('i');
            const isCollapsed = tocContainer.classList.contains('collapsed');
            
            if (icon && isCollapsed) {
                if (window.innerWidth > 1024) {
                    icon.className = 'fas fa-chevron-right';
                    // 桌面端：移除 display 限制，让 CSS 处理
                    tocContent.style.display = '';
                } else {
                    icon.className = 'fas fa-chevron-down';
                    // 移动端：保持 display 控制
                    tocContent.style.display = 'none';
                }
            }
        }, 150); // 150ms 防抖延迟
    });
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
                    
                    // 滚动到可见区域 - 仅在桌面端（>1024px）启用，避免窄窗口下页面跳动
                    // 移动端禁用自动滚动，防止干扰用户正常浏览体验
                    const tocContent = document.getElementById('tocContent');
                    if (tocContent && window.innerWidth > 1024) {
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
    if (shareButtons.length === 0) return; // 添加元素存在性检查
    
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
    const pres = document.querySelectorAll('pre');
    if (pres.length === 0) return; // 添加元素存在性检查
    
    pres.forEach(pre => {
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
            const codeElement = pre.querySelector('code');
            if (!codeElement) return; // 添加 code 元素存在性检查
            
            const code = codeElement.textContent;
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
    const images = document.querySelectorAll('.article-content img');
    if (images.length === 0) return; // 添加元素存在性检查
    
    images.forEach(img => {
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
            
            // ESC 键关闭
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