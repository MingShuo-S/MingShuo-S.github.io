// 网站主脚本
document.addEventListener('DOMContentLoaded', function() {
    // ===== 初始化 =====
    initializeTheme();
    initializeMobileMenu();
    loadSampleData();
    initializeStats();
    
    // ===== 主题切换 =====
    function initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('i');
        
        // 从 localStorage 读取主题设置
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(themeIcon, savedTheme);
        
        // 切换主题
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(themeIcon, newTheme);
        });
    }
    
    function updateThemeIcon(icon, theme) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // ===== 移动端菜单 =====
    function initializeMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', 
                    menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
                );
            });
            
            // 点击外部关闭菜单
            document.addEventListener('click', function(event) {
                if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }
    
    // ===== 加载示例数据 =====
    function loadSampleData() {
        // 检查页面是否已经有文章内容（由构建脚本生成）
        const articlesGrid = document.getElementById('articlesGrid');
        const projectsGrid = document.getElementById('projectsGrid');
        
        // 如果文章列表已经有内容，说明是构建时生成的真实文章，不覆盖
        if (articlesGrid && articlesGrid.children.length > 0) {
            console.log('✅ 已加载构建时生成的文章列表');
        } else {
            // 只有在没有真实文章时才显示示例数据
            console.log('⚠️  无真实文章，加载示例数据');
            const sampleArticles = getSampleArticles();
            renderArticles(sampleArticles);
            
            // 同时更新统计中的文章数量
            const stats = {
                articles: sampleArticles.length,
                projects: getSampleProjects().length,
                words: 12500
            };
            updateStats(stats);
        }
        
        // 项目列表暂时保持示例数据（因为还没有项目数据源）
        if (projectsGrid && projectsGrid.children.length === 0) {
            renderProjects(getSampleProjects());
        }
    }
    
    // 获取示例文章数据
    function getSampleArticles() {
        return [
            {
                id: 'hello-world',
                title: '你好，世界！',
                excerpt: '这是我的第一篇博客文章，我将在这里记录我的技术学习和成长。',
                category: '随笔',
                date: '2025-01-20',
                tags: ['博客', '入门']
            },
            {
                id: 'remup-design',
                title: 'RemUp 设计念',
                excerpt: '记录我设计 RemUp 标记语言的思考过程和实现思路。',
                category: '技术',
                date: '2025-01-18',
                tags: ['编译器', '开源', '工具']
            },
            {
                id: 'nju-notes',
                title: '南大软工学习笔记',
                excerpt: '作为南京大学软件工程大一新生的学习记录和经验分享。',
                category: '学习',
                date: '2025-01-15',
                tags: ['南京大学', '软件工程', '学习']
            }
        ];
    }
    
    // 获取示例项目数据
    function getSampleProjects() {
        return [
            {
                id: 'remup',
                title: 'RemUp 标记语言',
                description: '一个创新的轻量级标记语言，重新思考文档编辑体验。',
                status: '开发中',
                tags: ['TypeScript', '编译器', '开源']
            },
            {
                id: 'personal-blog',
                title: '个人博客系统',
                description: '从零开始搭建的个人博客系统，使用纯前端技术栈。',
                status: '已完成',
                tags: ['JavaScript', 'HTML', 'CSS']
            }
        ];
    }
    
    function renderArticles(articles) {
        const articlesGrid = document.getElementById('articlesGrid');
        if (!articlesGrid) return;
        
        articlesGrid.innerHTML = articles.map(article => `
            <article class="article-card">
                <div class="card-header">
                    <div class="card-category">${article.category}</div>
                    <h3 class="card-title">
                        <a href="/posts/${article.id}/">${article.title}</a>
                    </h3>
                    <p class="card-excerpt">${article.excerpt}</p>
                </div>
                <div class="card-footer">
                    <div class="card-date">${formatDate(article.date)}</div>
                    <div class="card-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');
    }
    
    // 渲染项目列表
    function renderProjects(projects) {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = projects.map(project => `
            <article class="project-card">
                <div class="card-header">
                    <div class="card-category">${project.status}</div>
                    <h3 class="card-title">
                        <a href="/projects/${project.id}/">${project.title}</a>
                    </h3>
                    <p class="card-excerpt">${project.description}</p>
                </div>
                <div class="card-footer">
                    <div class="card-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');
    }
    
    // ===== 统计数据 =====
    function initializeStats() {
        // 计算网站运行天数
        const startDate = new Date('2026-03-12');
        const today = new Date();
        const timeDiff = today.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        document.getElementById('siteDays').textContent = daysDiff;
        
        // 更新最后修改时间
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = formatDate(new Date().toISOString().split('T')[0]);
        }
    }
    
    function updateStats(stats) {
        const totalArticles = document.getElementById('totalArticles');
        const totalProjects = document.getElementById('totalProjects');
        const totalWords = document.getElementById('totalWords');
        
        if (totalArticles) animateCount(totalArticles, stats.articles);
        if (totalProjects) animateCount(totalProjects, stats.projects);
        if (totalWords) animateCount(totalWords, stats.words);
    }
    
    function animateCount(element, target) {
        const duration = 2000; // 动画时长
        const step = 20; // 更新间隔
        const increment = target / (duration / step);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, step);
    }
    
    // ===== 工具函数 =====
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // ===== 平滑滚动 =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 移动端关闭菜单
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu) navMenu.classList.remove('active');
            }
        });
    });
    
    // ===== 页面加载动画 =====
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});