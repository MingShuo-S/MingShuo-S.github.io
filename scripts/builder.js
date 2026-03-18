const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

class SafeSiteBuilder {
    constructor() {
        // 源码目录
        this.sourceDir = path.join(__dirname, '..', 'src');
        // 最终输出目录（用于文章页面、资源等）
        this.finalOutputDir = path.join(__dirname, '..', 'public');
        // 临时构建目录
        this.tempOutputDir = path.join(__dirname, '..', '.temp_public');
        // 当前使用的输出目录
        this.outputDir = this.tempOutputDir;
        // 主页输出目录（项目根目录）
        this.rootOutputDir = path.join(__dirname, '..');

        this.templateDir = path.join(this.sourceDir, 'templates');
        this.dataDir = path.join(this.sourceDir, 'data');
        this.assetsDir = path.join(this.sourceDir, 'assets');
    }

    async build() {
        console.log('🔨 开始构建网站...');
        const startTime = Date.now();

        try {
            // 1. 准备临时构建目录
            await this.prepareTempDir();

            // 2. 读取网站配置
            const siteConfig = await this.readConfig();

            // 3. 处理所有文章
            console.log('📄 处理文章中...');
            const articles = await this.processArticles();

            // 4. 生成文章页面
            for (const article of articles) {
                await this.generateArticlePage(article, siteConfig);
            }

            // 5. 生成主页（包含最新文章列表）
            await this.generateHomePage(articles, siteConfig);
            
            // 6. 生成文章列表页
            await this.generateArticlesIndex(articles, siteConfig);

            // 7. 复制静态资源
            await this.copyAssets();

            // 8. 生成功能页面
            await this.generateProjectsPage(siteConfig);
            await this.generateAboutPage(siteConfig);

            // 9. 生成站点地图
            await this.generateSitemap(articles, siteConfig);

            // 10. 用临时目录安全地替换最终目录
            await this.replaceFinalOutput();

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ 构建完成！耗时 ${duration} 秒`);
            console.log(`📄 文章: ${articles.length} 篇`);
            console.log(`📁 输出目录: ${this.finalOutputDir}`);

        } catch (error) {
            console.error('❌ 构建失败:', error.message);
            // 清理临时目录
            await this.cleanupTempDir();
            process.exit(1);
        }
    }

    async prepareTempDir() {
        if (await fs.pathExists(this.tempOutputDir)) {
            await fs.remove(this.tempOutputDir);
        }
        await fs.ensureDir(this.tempOutputDir);
        console.log('📁 准备临时构建目录完成');
    }

    async replaceFinalOutput() {
        // 保存根目录的 index.html（如果存在）
        const rootIndexPath = path.join(this.rootOutputDir, 'index.html');
        let savedRootIndex = null;
        
        if (await fs.pathExists(rootIndexPath)) {
            savedRootIndex = await fs.readFile(rootIndexPath, 'utf-8');
            console.log('💾 已保存根目录的 index.html');
        }
        
        if (await fs.pathExists(this.finalOutputDir)) {
            try {
                await fs.remove(this.finalOutputDir);
            } catch (error) {
                console.log('⚠️  最终目录被占用，尝试重命名...');
                const timestamp = new Date().getTime();
                const backupDir = `${this.finalOutputDir}_backup_${timestamp}`;
                await fs.move(this.finalOutputDir, backupDir);
                console.log(`📦 旧目录已备份至：${backupDir}`);
            }
        }

        await fs.move(this.tempOutputDir, this.finalOutputDir);
        console.log('🔄 已更新最终输出目录');
        
        // 恢复根目录的 index.html
        if (savedRootIndex !== null) {
            await fs.writeFile(rootIndexPath, savedRootIndex, 'utf-8');
            console.log('📄 已恢复根目录的 index.html');
        }
    }

    async cleanupTempDir() {
        if (await fs.pathExists(this.tempOutputDir)) {
            await fs.remove(this.tempOutputDir).catch(() => {});
        }
    }

    async readConfig() {
        const configFile = path.join(this.dataDir, 'config.json');

        if (!await fs.pathExists(configFile)) {
            throw new Error(`配置文件不存在: ${configFile}`);
        }

        const config = await fs.readJson(configFile);
        console.log('📄 已读取配置文件');
        return config;
    }

    async processArticles() {
        const articlesDir = path.join(this.dataDir, 'articles');

        if (!await fs.pathExists(articlesDir)) {
            console.log('📝 未找到文章目录，跳过文章处理');
            return [];
        }

        const files = await fs.readdir(articlesDir);
        const articles = [];

        for (const file of files) {
            if (file.endsWith('.md')) {
                console.log(`  📄 处理: ${file}`);

                try {
                    const filePath = path.join(articlesDir, file);
                    const fileContent = await fs.readFile(filePath, 'utf-8');

                    // 解析 Front Matter 和正文
                    const { data: frontmatter, content: markdown } = matter(fileContent);

                    // 生成文章 slug
                    const slug = this.generateSlug(file, frontmatter.title);

                    // 转换 Markdown 为 HTML
                    marked.setOptions({ 
                        gfm: true, 
                        breaks: true,
                        headerIds: true
                    });
                    const htmlContent = marked.parse(markdown);

                    // 计算阅读时间
                    const wordCount = markdown.split(/\s+/).length;
                    const readTime = Math.max(1, Math.ceil(wordCount / 200));

                    // 格式化日期
                    const rawDate = frontmatter.date || this.extractDateFromFilename(file) || new Date().toISOString().split('T')[0];
                    const formattedDate = this.formatDate(rawDate);

                    // 构建文章对象
                    const article = {
                        ...frontmatter,
                        slug,
                        content: htmlContent,
                        rawDate,
                        formattedDate,
                        fileName: file,
                        read_time: readTime,
                        wordCount: wordCount,
                        url: `/posts/${slug}/`
                    };

                    if (!article.title) {
                        article.title = this.slugToTitle(slug);
                    }

                    articles.push(article);

                } catch (error) {
                    console.error(`❌ 处理文章 ${file} 失败:`, error.message);
                }
            }
        }

        return articles.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
    }

    async generateArticlePage(article, siteConfig) {
        const templateFile = path.join(this.templateDir, 'article.html');

        if (!await fs.pathExists(templateFile)) {
            console.log('⚠️  未找到文章模板 article.html，跳过文章页面生成');
            return;
        }

        let html = await fs.readFile(templateFile, 'utf-8');

        // 替换所有变量
        const replacements = {
            // 文章变量
            '{{title}}': article.title || '无标题',
            '{{summary}}': article.summary || article.title,
            '{{date}}': article.rawDate,
            '{{formattedDate}}': article.formattedDate,
            '{{content}}': article.content,
            '{{category}}': article.category || '未分类',
            '{{read_time}}': article.read_time,
            '{{difficulty}}': article.difficulty || '中等',
            '{{slug}}': article.slug,
            '{{author}}': siteConfig.site.author,
            '{{author_bio}}': '编程菜鸟这一块',
            
            // 站点变量
            '{{site.title}}': siteConfig.site.title,
            '{{site.description}}': siteConfig.site.description,
            '{{site.author}}': siteConfig.site.author,
            '{{site.year}}': siteConfig.site.year,
            '{{site.url}}': siteConfig.site.url,
            '{{site.email}}': siteConfig.social?.email || '',
            '{{site.social.github}}': siteConfig.social?.github || '',
            '{{site.social.bilibili}}': siteConfig.social?.bilibili || ''
        };

        // 处理条件语句
        html = this.processConditionalStatements(html, article, siteConfig);

        // 处理标签 - 使用正则表达式更灵活地匹配
        if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
            const tagsHtml = article.tags.map(tag => `<a href="/tags/${tag}" class="tag">${tag}</a>`).join('\n');
            html = html.replace(
                /(<div class="tags-list">\s*)\{\{article_tags\}\}(\s*<\/div>)/,
                `$1${tagsHtml}$2`
            );
        } else {
            // 移除整个标签块
            html = html.replace(
                /\s*<div class="article-tags">\s*<h3>🏷️ 标签<\/h3>\s*<div class="tags-list">\s*\{\{article_tags\}\}\s*<\/div>\s*<\/div>/g,
                ''
            );
        }

        // 处理参考书目 - 使用正则表达式更灵活地匹配
        if (article.bibliography && Array.isArray(article.bibliography) && article.bibliography.length > 0) {
            const bibliographyHtml = article.bibliography.map(item => `<li>${item}</li>`).join('\n');
            html = html.replace(
                /(<ul>\s*)\{\{bibliography_items\}\}(\s*<\/ul>)/,
                `$1${bibliographyHtml}$2`
            );
        } else {
            // 移除整个参考文献块
            html = html.replace(
                /\s*<div class="article-bibliography">\s*<h3>📚 参考文献<\/h3>\s*<ul>\s*\{\{bibliography_items\}\}\s*<\/ul>\s*<\/div>/g,
                ''
            );
        }

        // 先处理 content 变量（使用特殊标记避免冲突）
        const contentPlaceholder = '___ARTICLE_CONTENT_PLACEHOLDER___';
        html = html.replace('{{{content}}}', contentPlaceholder);
        html = html.replace('{{content}}', contentPlaceholder);

        // 替换其他变量
        html = this.replaceVariables(html, replacements);

        // 最后替换实际的文章内容
        html = html.replace(contentPlaceholder, article.content || '');
        
        // 对于文章页面（在 /posts/{slug}/ 目录下，深度为 3 层），需要将资源路径调整为相对路径
        // 将 /assets/ 转换为 ../../assets/
        // 将 /writings 改为 ../../writings
        // 将 /projects 改为 ../../projects
        // 将 /about 改为 ../../about
        // 将 / 改为 ../../
        html = html.replace(/(href|src)="\/assets\//g, '$1="../../assets/');
        html = html.replace(/href="\/writings"/g, 'href="../../writings"');
        html = html.replace(/href="\/projects"/g, 'href="../../projects"');
        html = html.replace(/href="\/about"/g, 'href="../../about"');
        // 注意：根路径 "/" 的替换需要排除 href="/" 的情况，避免影响非相对路径的链接
        const pathPattern = /(href|src)="(?!\/")(\/[^"]+)"/g;
        html = html.replace(pathPattern, function(match, attr, path) {
            return attr + '="../../' + path.substring(1) + '"';
        });

        // 创建文章输出目录
        const articleDir = path.join(this.outputDir, 'posts', article.slug);
        await fs.ensureDir(articleDir);

        // 写入文章页面
        await fs.writeFile(path.join(articleDir, 'index.html'), html);
        console.log(`  📄 生成文章: /posts/${article.slug}/`);
    }

    processConditionalStatements(html, article, siteConfig) {
        // 处理封面图片条件
        if (article.cover_image && article.cover_image.trim()) {
            html = html.replace('{{#if cover_image}}', '');
            html = html.replace('{{/if}}', '');
            html = html.replace('{{cover_image}}', article.cover_image);
        } else {
            // 移除整个封面块
            html = html.replace(/{{#if cover_image}}[\s\S]*?{{\/if}}/g, '');
        }

        // 处理难度条件
        if (article.difficulty) {
            html = html.replace('{{#if difficulty}}', '');
            html = html.replace('{{/if}}', '');
        } else {
            html = html.replace(/{{#if difficulty}}[\s\S]*?{{\/if}}/g, '');
        }

        // 处理摘要条件
        if (article.summary) {
            html = html.replace('{{#if summary}}', '');
            html = html.replace('{{/if}}', '');
        } else {
            html = html.replace(/{{#if summary}}[\s\S]*?{{\/if}}/g, '');
        }

        // 处理标签条件
        if (article.tags && article.tags.length > 0) {
            html = html.replace('{{#if tags}}', '');
            html = html.replace('{{/if}}', '');
        } else {
            html = html.replace(/{{#if tags}}[\s\S]*?{{\/if}}/g, '');
        }

        // 处理参考书目条件
        if (article.bibliography && article.bibliography.length > 0) {
            html = html.replace('{{#if bibliography}}', '');
            html = html.replace('{{/if}}', '');
        } else {
            html = html.replace(/{{#if bibliography}}[\s\S]*?{{\/if}}/g, '');
        }

        return html;
    }

    async generateHomePage(articles, siteConfig) {
        const templateFile = path.join(this.templateDir, 'index.html');

        if (!await fs.pathExists(templateFile)) {
            throw new Error('未找到主页模板 index.html');
        }

        let html = await fs.readFile(templateFile, 'utf-8');

        // 读取项目数据
        const projectsFile = path.join(this.dataDir, 'projects.json');
        let projects = [];
        if (await fs.pathExists(projectsFile)) {
            const projectsData = await fs.readJson(projectsFile);
            projects = projectsData.projects || [];
        }

        // 生成实际的文章列表 HTML
        const latestArticles = articles.slice(0, 3);
        let articlesHtml = '';
        
        if (latestArticles.length > 0) {
            articlesHtml = latestArticles.map(article => `
                <article class="article-card">
                    <div class="card-header">
                        <div class="card-category">${article.category || '未分类'}</div>
                        <h3 class="card-title">
                            <a href="/posts/${article.slug}/">${article.title}</a>
                        </h3>
                        <p class="card-excerpt">${article.summary || '暂无摘要'}</p>
                    </div>
                    <div class="card-footer">
                        <div class="card-date">${article.formattedDate}</div>
                        <div class="card-tags">
                            ${(article.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </article>
            `).join('\n');
        } else {
            articlesHtml = '<p class="no-articles">暂无文章，欢迎关注后续更新。</p>';
        }

        // 生成精选项目列表 HTML（只显示 featured 项目，最多 2 个）
        let projectsHtml = '';
        const featuredProjects = projects.filter(p => p.featured).slice(0, 2);
        
        if (featuredProjects.length > 0) {
            projectsHtml = featuredProjects.map(project => {
                const statusText = this.getStatusText(project.status);
                const tagsHtml = (project.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('');
                const githubLink = project.github ? 
                    `<a href="https://github.com/${project.github}" target="_blank" rel="noopener" class="btn btn-secondary">
                        <i class="fab fa-github"></i> GitHub
                    </a>` : '';
                
                return `
                <article class="project-card${project.featured ? ' featured' : ''}" data-category="${project.category}">
                    <div class="project-icon">${project.icon || '🚀'}</div>
                    <h2 class="project-title">${project.title}</h2>
                    
                    <span class="project-status status-${project.status}">
                        ${statusText}
                    </span>
                    
                    <p class="project-description">${project.description}</p>
                    
                    <div class="project-tags">
                        ${tagsHtml}
                    </div>
                    
                    <div class="project-footer">
                        <div class="project-links">
                            <a href="${project.url || '#'}" target="_blank" rel="noopener" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> 访问项目
                            </a>
                            ${githubLink}
                        </div>
                    </div>
                </article>
                `;
            }).join('\n');
        } else {
            projectsHtml = '<p class="no-projects">暂无项目，敬请期待！</p>';
        }

        // 计算统计信息
        const totalWords = articles.reduce((sum, article) => sum + (article.wordCount || 0), 0);
        const siteDays = this.calculateSiteDays('2025-01-01');
        const totalStars = projects.reduce((sum, p) => sum + (p.stars || 0), 0);
        const languages = [...new Set(projects.map(p => p.language).filter(Boolean))];
        const languagesCount = languages.length;

        // 替换站点配置变量
        html = this.replaceVariables(html, {
            '{{site.title}}': siteConfig.site.title,
            '{{site.description}}': siteConfig.site.description,
            '{{site.author}}': siteConfig.site.author,
            '{{site.year}}': siteConfig.site.year,
            '{{site.url}}': siteConfig.site.url,
            '{{site.keywords}}': siteConfig.site.keywords || '',
            '{{site.email}}': siteConfig.social?.email || '',
            '{{site.social.github}}': siteConfig.social?.github || '',
            '{{site.social.bilibili}}': siteConfig.social?.bilibili || ''
        });

        // 替换文章列表
        const articlesGridStart = html.indexOf('<div class="articles-grid" id="articlesGrid">');
        const articlesGridEnd = html.indexOf('</div>', articlesGridStart) + 6;
        
        if (articlesGridStart !== -1 && articlesGridEnd !== -1) {
            html = html.substring(0, articlesGridStart) + 
                  `<div class="articles-grid" id="articlesGrid">\n${articlesHtml}\n</div>` + 
                  html.substring(articlesGridEnd);
        }

        // 替换项目列表
        const projectsGridStart = html.indexOf('<div class="projects-grid" id="projectsGrid">');
        const projectsGridEnd = html.indexOf('</div>', projectsGridStart) + 6;
        
        if (projectsGridStart !== -1 && projectsGridEnd !== -1) {
            html = html.substring(0, projectsGridStart) + 
                  `<div class="projects-grid" id="projectsGrid">\n${projectsHtml}\n</div>` + 
                  html.substring(projectsGridEnd);
        }

        // 更新统计信息
        html = html.replace(/id="totalArticles">[^<]*</, `id="totalArticles">${articles.length}<`);
        html = html.replace(/id="totalWords">[^<]*</, `id="totalWords">${totalWords}<`);
        html = html.replace(/id="siteDays">[^<]*</, `id="siteDays">${siteDays}<`);
        html = html.replace(/id="totalProjects">[^<]*</, `id="totalProjects">${projects.length}<`);
        html = html.replace(/id="totalStars">[^<]*</, `id="totalStars">${totalStars}<`);
        html = html.replace(/id="languagesCount">[^<]*</, `id="languagesCount">${languagesCount}<`);
        
        // 为根目录的 index.html 添加 /public 前缀到所有内部链接
        // 替换 href 属性中的链接（排除外部链接、锚点链接、mailto:、tel: 等特殊协议）
        // 注意：保留根路径 / 不变（首页链接）
        html = html.replace(/href="(?!https?:\/\/)(?!#)(?!mailto:)(?!tel:)(?!\/")([^"]+)"/g, 'href="/public$1"');
        // 替换 src 属性中的链接（排除外部链接）
        html = html.replace(/src="(?!https?:\/\/)([^"]+)"/g, 'src="/public$1"');
        
        // 在主页中添加 projects.css 引用（在 style.css 之后）
        html = html.replace(
            '<link rel="stylesheet" href="/public/assets/css/style.css">',
            '<link rel="stylesheet" href="/public/assets/css/style.css">\n    <link rel="stylesheet" href="/public/assets/css/projects.css">'
        );

        // 确保输出目录存在（临时目录用于其他资源）
        await fs.ensureDir(this.outputDir);
        
        // 确保根目录输出路径存在
        await fs.ensureDir(this.rootOutputDir);

        // 写入主页到项目根目录
        await fs.writeFile(path.join(this.rootOutputDir, 'index.html'), html);
        console.log('🏠 已生成主页 index.html 到项目根目录（包含最新文章和精选项目）');
    }

    async generateArticlesIndex(articles, siteConfig) {
        const articlesDir = path.join(this.outputDir, 'writings');
        await fs.ensureDir(articlesDir);

        // 生成文章列表的 HTML
        let articlesListHtml = '';
        if (articles.length > 0) {
            articlesListHtml = articles.map(article => `
                <article class="article-card">
                    <div class="card-header">
                        <div class="card-category">${article.category || '未分类'}</div>
                        <h3 class="card-title">
                            <a href="../posts/${article.slug}/">${article.title}</a>
                        </h3>
                        <p class="card-excerpt">${article.summary || '暂无摘要'}</p>
                    </div>
                    <div class="card-footer">
                        <div class="card-date">${article.formattedDate}</div>
                        <div class="card-tags">
                            ${(article.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </article>
            `).join('\n');
        } else {
            articlesListHtml = '<p class="no-articles">暂无文章。</p>';
        }

        // 生成完整的文章列表页
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>所有文章 | ${siteConfig.site.title}</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .articles-list-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .articles-header { margin-bottom: 3rem; }
        .articles-count { color: #666; font-size: 1.1rem; }
        .no-articles { text-align: center; padding: 3rem; color: #888; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <a href="../../" class="nav-brand">${siteConfig.site.title}</a>
            <div class="nav-menu">
                <a href="../../" class="nav-link">首页</a>
                <a href="../writings" class="nav-link active">文章</a>
                <a href="../projects" class="nav-link">项目</a>
                <a href="../about" class="nav-link">关于</a>
            </div>
        </div>
    </nav>
    
    <div class="articles-list-container">
        <header class="articles-header">
            <h1>所有文章</h1>
            <p class="articles-count">共 ${articles.length} 篇文章</p>
        </header>
        <div class="articles-grid">
            ${articlesListHtml}
        </div>
        <div style="margin-top: 3rem; text-align: center;">
            <a href="../../" class="btn">返回首页</a>
        </div>
    </div>
</body>
</html>`;

        await fs.writeFile(path.join(articlesDir, 'index.html'), html);
        console.log('📚 已生成文章列表页 /writings/');
    }

    async generateProjectsPage(siteConfig) {
        const templateFile = path.join(this.templateDir, 'projects.html');
        const dataFile = path.join(this.dataDir, 'projects.json');

        if (!await fs.pathExists(templateFile)) {
            console.log('⚠️  未找到 projects 模板，跳过 projects 页面生成');
            return;
        }

        if (!await fs.pathExists(dataFile)) {
            console.log('⚠️  未找到 projects 数据文件，跳过 projects 页面生成');
            return;
        }

        // 读取模板和数据
        let html = await fs.readFile(templateFile, 'utf-8');
        const projectsData = await fs.readJson(dataFile);

        // 合并数据
        const data = {
            page: {
                title: '项目展示',
                description: '展示我的个人项目和开源作品',
                keywords: '项目，开源，GitHub，编程作品',
                og_description: '探索我的技术项目和开源贡献'
            },
            projects: {
                ...siteConfig.projects,
                items: projectsData.projects || []
            },
            categories: projectsData.categories || [],
            site: siteConfig.site,
            social: siteConfig.social
        };

        // 处理项目列表 - 使用占位符替换
        if (data.projects.items && Array.isArray(data.projects.items)) {
            const projectsHtml = data.projects.items.map(project => {
                const featuredClass = project.featured ? 'featured' : '';
                const statusText = this.getStatusText(project.status);
                const tagsHtml = (project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
                const githubLink = project.github ? 
                    `<a href="https://github.com/${project.github}" target="_blank" rel="noopener" class="btn btn-secondary">
                        <i class="fab fa-github"></i> GitHub
                    </a>` : '';
                
                return `
                <article class="project-card ${featuredClass}" data-category="${project.category}">
                    <div class="project-icon">${project.icon || '🚀'}</div>
                    <h2 class="project-title">${project.title}</h2>
                    
                    <span class="project-status status-${project.status}">
                        ${statusText}
                    </span>
                    
                    <p class="project-description">${project.description}</p>
                    
                    <div class="project-tags">
                        ${tagsHtml}
                    </div>
                    
                    <div class="project-footer">
                        <div class="project-links">
                            <a href="${project.url || '#'}" target="_blank" rel="noopener" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> 访问项目
                            </a>
                            ${githubLink}
                        </div>
                    </div>
                </article>
                `;
            }).join('\n');
            
            // 使用占位符替换项目列表
            html = html.replace('___PROJECTS_HTML_PLACEHOLDER___', projectsHtml);
        } else {
            // 如果没有项目，显示空状态
            html = html.replace('___PROJECTS_HTML_PLACEHOLDER___', `
                <div class="no-projects">
                    <i class="fas fa-box-open"></i>
                    <h2>暂无项目</h2>
                    <p>这里还没有项目，敬请期待！</p>
                </div>
            `);
        }

        // 处理分类的 each 循环
        if (data.categories && Array.isArray(data.categories)) {
            const categoriesHtml = data.categories.map(cat => 
                `<button class="filter-btn" data-filter="${cat.filter}">${cat.name}</button>`
            ).join('');
            
            const categoriesEachRegex = /\{\{#each categories\}\}([\s\S]*?)\{\{\/each\}\}/g;
            html = html.replace(categoriesEachRegex, categoriesHtml);
        }

        // 替换简单变量
        html = this.replaceVariables(html, {
            '{{page.title}}': data.page.title,
            '{{page.description}}': data.page.description,
            '{{page.keywords}}': data.page.keywords,
            '{{page.og_description}}': data.page.og_description,
            '{{projects.intro}}': data.projects.intro || '',
            '{{projects.stats.most_used_language}}': data.projects.stats?.most_used_language || 'JavaScript',
            '{{site.title}}': siteConfig.site.title,
            '{{site.description}}': siteConfig.site.description,
            '{{site.author}}': siteConfig.site.author,
            '{{site.year}}': siteConfig.site.year,
            '{{site.url}}': siteConfig.site.url,
            '{{site.email}}': siteConfig.social?.email || '',
            '{{site.social.github}}': siteConfig.social?.github || '',
            '{{site.social.bilibili}}': siteConfig.social?.bilibili || ''
        });

        // 更新统计数据
        const totalProjects = data.projects.items.length;
        const totalStars = data.projects.items.reduce((sum, p) => sum + (p.stars || 0), 0);
        const languages = [...new Set(data.projects.items.map(p => p.language).filter(Boolean))];
        const languagesCount = languages.length;
        
        html = html.replace(/id="totalProjects">[^<]*</, `id="totalProjects">${totalProjects}<`);
        html = html.replace(/id="totalStars">[^<]*</, `id="totalStars">${totalStars}<`);
        html = html.replace(/id="languagesCount">[^<]*</, `id="languagesCount">${languagesCount}<`);

        // 路径转换（projects 页面在 /projects/ 目录下，深度为 3 层）
        // 将 /assets/ 转换为 ../../assets/
        html = html.replace(/(href|src)="\/assets\//g, '$1="../../assets/"');
        
        // 创建 projects 输出目录
        const pageDir = path.join(this.outputDir, 'projects');
        await fs.ensureDir(pageDir);

        // 写入 projects 页面
        await fs.writeFile(path.join(pageDir, 'index.html'), html);
        console.log('📄 已生成项目页面 /projects/');
    }

    getStatusText(status) {
        const statusMap = {
            'active': '🟢 进行中',
            'developing': '🔵 开发中',
            'experimental': '🟡 实验中',
            'completed': '✅ 已完成',
            'archived': '📦 已归档'
        };
        return statusMap[status] || '⚪ 未知';
    }

    async generateAboutPage(siteConfig) {
        const templateFile = path.join(this.templateDir, 'about.html');
        const dataFile = path.join(this.dataDir, 'about.json');

        if (!await fs.pathExists(templateFile)) {
            console.log('⚠️  未找到 about 模板，跳过 about 页面生成');
            return;
        }

        if (!await fs.pathExists(dataFile)) {
            console.log('⚠️  未找到 about 数据文件，跳过 about 页面生成');
            return;
        }

        // 读取模板和数据
        let html = await fs.readFile(templateFile, 'utf-8');
        const aboutData = await fs.readJson(dataFile);

        // 合并数据
        const data = {
            ...aboutData,
            site: siteConfig.site,
            social: siteConfig.social
        };

        // 替换变量
        html = this.replaceTemplateVariables(html, data);

        // 路径转换（about 页面在根目录下，深度为 2 层）
        // 将 /assets/ 转换为 ../assets/
        html = html.replace(/(href|src)="\/assets\//g, '$1="../assets/"');
        
        // 创建 about 输出目录
        const pageDir = path.join(this.outputDir, 'about');
        await fs.ensureDir(pageDir);

        // 写入 about 页面
        await fs.writeFile(path.join(pageDir, 'index.html'), html);
        console.log('📄 已生成 about 页面 /about/');
    }

    replaceTemplateVariables(html, data) {
        let result = html;
        
        // 处理简单变量 {{variable}}
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                result = result.replace(regex, value);
            }
        }
        
        // 处理嵌套对象变量 {{object.key}}
        const self = this;
        function processNested(obj, prefix = '') {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'string') {
                    const regex = new RegExp(`\\{\\{${fullKey}\\}\\}`, 'g');
                    result = result.replace(regex, value);
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    processNested(value, fullKey);
                }
            }
        }
        processNested(data);
        
        // 处理 each 循环 {{#each array}}...{{/each}}
        const eachRegex = /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        result = result.replace(eachRegex, (match, arrayName, template) => {
            const array = self.getNestedValue(data, arrayName);
            if (!Array.isArray(array)) {
                return '';
            }
            
            return array.map(item => {
                let itemHtml = template;
                if (typeof item === 'object') {
                    for (const [key, value] of Object.entries(item)) {
                        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                        itemHtml = itemHtml.replace(regex, value || '');
                    }
                } else if (typeof item === 'string') {
                    // 处理字符串类型的数组项（如 badges）
                    itemHtml = itemHtml.replace(/\{\{this\}\}/g, item);
                }
                return itemHtml;
            }).join('');
        });
        
        return result;
    }

    async copyAssets() {
        if (await fs.pathExists(this.assetsDir)) {
            const destAssetsDir = path.join(this.outputDir, 'assets');
            await fs.copy(this.assetsDir, destAssetsDir);
            console.log('📁 已复制静态资源');
        } else {
            console.log('⚠️  未找到静态资源目录');
        }
    }

    async generateSitemap(articles, siteConfig) {
        const baseUrl = siteConfig.site.url || 'https://mingshuo-s.github.io';
        const currentDate = new Date().toISOString().split('T')[0];

        let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/writings/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;

        for (const article of articles) {
            sitemapXml += `
    <url>
        <loc>${baseUrl}/posts/${article.slug}/</loc>
        <lastmod>${article.rawDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
        }

        sitemapXml += '\n</urlset>';

        await fs.writeFile(path.join(this.outputDir, 'sitemap.xml'), sitemapXml);
        console.log('🗺️  已生成站点地图 sitemap.xml');
    }

    // ========== 工具函数 ==========
    
    /**
     * 获取嵌套对象的值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }
    
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    replaceVariables(html, variables) {
        let result = html;
        for (const [key, value] of Object.entries(variables)) {
            // 跳过 content 变量，因为它已经单独处理了
            if (key === '{{content}}') {
                continue;
            }
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, value || '');
        }
        return result;
    }

    generateSlug(filename, title) {
        if (title) {
            // 对于中文标题，使用文件名作为基础（移除日期前缀）
            const slugFromFilename = filename
                .replace('.md', '')
                .replace(/^\d{4}-\d{2}-\d{2}-/, '')
                .toLowerCase();
            
            // 如果标题是中文，使用文件名生成的 slug
            // 如果标题是英文，使用标题生成的 slug
            const isChinese = /[\u4e00-\u9fa5]/.test(title);
            
            if (isChinese) {
                return slugFromFilename;
            } else {
                return title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();
            }
        }
        
        // 如果没有标题，使用文件名
        return filename
            .replace('.md', '')
            .replace(/^\d{4}-\d{2}-\d{2}-/, '')
            .toLowerCase();
    }

    slugToTitle(slug) {
        return slug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    extractDateFromFilename(filename) {
        const match = filename.match(/^(\d{4}-\d{2}-\d{2})-/);
        return match ? match[1] : null;
    }

    calculateSiteDays(startDate) {
        const start = new Date(startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}

if (require.main === module) {
    const builder = new SafeSiteBuilder();
    builder.build();
}