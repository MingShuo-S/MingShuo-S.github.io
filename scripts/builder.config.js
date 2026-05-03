/**
 * Builder 配置文件
 * ============================================================
 * 这个文件集中管理 builder.js 中所有可配置的参数
 * 修改这里可以快速调整项目构建行为，无需直接修改 builder.js
 * ============================================================
 */

const path = require('path');

// 获取项目根目录（从 scripts/builder.config.js 往上退一层到项目根）
const PROJECT_ROOT = path.join(__dirname, '..');

module.exports = {
    // ============================================================
    // 1. 目录配置
    // ============================================================
    directories: {
        // 源代码目录（所有模板、数据、资源的来源）
        source: path.join(PROJECT_ROOT, 'src'),
        
        // 最终输出目录（构建完成后的正式输出位置）
        // 这是生成的静态网站所在的位置
        finalOutput: path.join(PROJECT_ROOT, 'public'),
        
        // 临时输出目录（构建过程中的临时位置）
        // 构建完成后会替换最终输出目录，确保原子性操作
        tempOutput: path.join(PROJECT_ROOT, '.temp_public'),
        
        // 项目根目录（主页 index.html 的输出位置）
        root: PROJECT_ROOT,
        
        // 以下是 src/ 下的子目录
        templates: path.join(PROJECT_ROOT, 'src', 'templates'),
        data: path.join(PROJECT_ROOT, 'src', 'data'),
        assets: path.join(PROJECT_ROOT, 'src', 'assets'),
    },

    // ============================================================
    // 2. 数据文件配置
    // ============================================================
    // 这里统一管理 src/data/ 下的 JSON 文件和文章目录
    // builder.js 会优先从这里读取路径，便于后续替换文件名或迁移目录
    dataFiles: {
        // 站点级配置：site、social、features、projects 等元信息
        siteConfig: path.join(PROJECT_ROOT, 'src', 'data', 'config.json'),

        // 页面数据文件
        about: path.join(PROJECT_ROOT, 'src', 'data', 'about.json'),
        projects: path.join(PROJECT_ROOT, 'src', 'data', 'projects.json'),
        friends: path.join(PROJECT_ROOT, 'src', 'data', 'friends.json'),
        tags: path.join(PROJECT_ROOT, 'src', 'data', 'tags.json'),

        // 文章目录（在非 Obsidian 模式下使用）
        articlesDir: path.join(PROJECT_ROOT, 'src', 'data', 'articles'),
    },

    // ============================================================
    // 3. Obsidian 集成配置
    // ============================================================
    obsidian: {
        // Obsidian 仓库的本地路径
        // 如果启用 Obsidian 模式，builder 会从这个目录读取 markdown 文件
        repositoryPath: 'C:\\Users\\29548\\Documents\\Sunshine\\ANOTES',
        
        // 是否启用 Obsidian 模式
        // true: 从 Obsidian 仓库直接读取 markdown 文件
        // false: 从 src/data/articles/ 读取 markdown 文件
        enabled: true,
        
        // 要忽略的文件夹（以这些名称开头的文件夹会被跳过）
        ignoreFolders: ['_', '.'],
        
        // 文章分类的来源
        // 'folder': 使用文件夹名称作为分类
        // 'frontmatter': 使用 Front Matter 中的 category 字段
        categorySource: 'folder',
    },

    // ============================================================
    // 4. 日期处理配置
    // ============================================================
    dates: {
        // 默认日期格式：'YYYY-MM-DD' 或 'YYYY/MM/DD'
        defaultFormat: 'YYYY-MM-DD',
        
        // 显示日期格式：'YYYY年MM月DD日' 或 'MMM DD, YYYY'
        displayFormat: 'YYYY年MM月DD日',
        
        // 网站成立日期（用于计算网站运营天数）
        siteStartDate: '2025-01-01',
        
        // 时间戳格式 (Atom/RSS)
        atomFormat: 'YYYY-MM-DDTHH:mm:ssZ',
    },

    // ============================================================
    // 5. 路径相对性配置
    // ============================================================
    // 不同页面位置对根目录的相对路径深度和处理规则
    paths: {
        // 文章页面：/posts/{slug}/ (深度3层)
        article: {
            relativePrefix: '../../',
            description: '文章页面位置: /posts/{slug}/',
            depth: 3,
        },
        
        // 公共列表页面：/{page}/ (深度2层，如 /writings/, /tags/, /projects/, /about/)
        publicPage: {
            relativePrefix: '../',
            description: '公共页面位置: /{page}/',
            depth: 2,
        },
        
        // 根目录首页：/index.html (深度1层)
        root: {
            relativePrefix: '/',
            description: '首页位置: /index.html',
            depth: 1,
            // 根目录首页需要添加 /public 前缀（GitHub Pages 部署需要）
            addPublicPrefix: true,
        },
    },

    // ============================================================
    // 6. 页面生成配置
    // ============================================================
    pages: {
        // 首页配置
        home: {
            // 显示最新文章数量
            latestArticlesCount: 3,
            
            // 显示精选项目数量
            featuredProjectsCount: 2,
            
            // 是否生成友情链接
            includeFriendsSection: true,
        },
        
        // 标签页配置
        tags: {
            // 标签排序方式：'count' (按文章数) 或 'name' (按字母)
            sortBy: 'count',
            
            // 是否按降序排列
            sortDescending: true,
        },
        
        // 归档页配置
        archive: {
            // 是否按年份分组
            groupByYear: true,
            
            // 是否按月份进一步分组
            groupByMonth: false,
        },
        
        // RSS 订阅配置
        rss: {
            // 订阅源标题
            title: "Sunshine's Blog",
            
            // 订阅源描述
            description: "记录技术思考、项目经验和学习成长",
            
            // 最大文章数（0 表示不限制）
            maxItems: 0,
            
            // 使用的链接协议
            linkProtocol: 'https',
        },
        
        // 站点地图配置
        sitemap: {
            // 是否包含文章
            includeArticles: true,
            
            // 是否包含列表页
            includePages: true,
            
            // 优先级权重：'high' / 'medium' / 'low'
            articlePriority: 'high',
            pagePriority: 'medium',
        },
    },

    // ============================================================
    // 7. 文章处理配置
    // ============================================================
    articles: {
        // Front Matter 中的默认字段
        frontMatter: {
            // 如果文章没有指定 tags，使用这个默认值
            defaultTags: [],
            
            // 如果文章没有指定 summary，是否自动从内容截取
            autoGenerateSummary: false,
            
            // 自动截取摘要的字符数
            summaryLength: 150,
            
            // 阅读时间的计算方式（字数 / 速度）
            wordsPerMinute: 200,
        },
        
        // 文件名中的日期提取方式
        // 支持的格式：
        // - 'YYYY-MM-DD-title.md' (在前面)
        // - 'title-YYYY-MM-DD.md' (在后面)
        datePattern: 'prefix', // 'prefix' 或 'suffix'
        
        // 是否自动为没有日期的文章添加创建日期
        autoAddDate: true,
        
        // Markdown 渲染选项
        markdown: {
            // 是否启用代码语法高亮
            highlight: true,
            
            // 是否启用 table
            tables: true,
            
            // 是否启用 strikethrough
            strikethrough: true,
            
            // 是否启用 task lists
            taskLists: true,
            
            // 是否自动为标题添加 ID (便于导航)
            addHeadingIds: true,
        },
    },

    // ============================================================
    // 8. 项目数据配置
    // ============================================================
    projects: {
        // 项目数据来源文件
        dataFile: 'src/data/projects.json',
        
        // 显示筛选器
        showFilters: true,
        
        // 项目排序方式：'date' / 'name' / 'stars'
        sortBy: 'date',
        
        // 是否按降序排列
        sortDescending: true,
    },

    // ============================================================
    // 9. 缓存配置
    // ============================================================
    cache: {
        // 是否启用模板缓存（加快构建速度）
        enableTemplateCache: true,
        
        // 是否启用数据缓存
        enableDataCache: false,
        
        // 缓存过期时间（毫秒），0 表示不过期
        expireTime: 0,
    },

    // ============================================================
    // 10. 调试配置
    // ============================================================
    debug: {
        // 是否启用详细日志
        verbose: false,
        
        // 是否在构建时保留临时文件（便于调试）
        keepTempFiles: false,
        
        // 是否输出路径转换的详细信息
        logPathTransforms: false,
        
        // 是否输出每个生成的文件
        logGeneratedFiles: true,
    },

    // ============================================================
    // 11. 输出优化配置
    // ============================================================
    optimization: {
        // 是否压缩 HTML 输出
        minifyHtml: false,
        
        // 是否压缩内联 CSS
        minifyCss: false,
        
        // 是否压缩内联 JavaScript
        minifyJs: false,
    },

    // ============================================================
    // 12. 统计和元数据配置
    // ============================================================
    metadata: {
        // 是否生成统计数据
        generateStats: true,
        
        // 是否生成 sitemap
        generateSitemap: true,
        
        // 是否生成 RSS
        generateRss: true,
        
        // 统计信息包括的内容
        stats: {
            totalArticles: true,
            totalWords: true,
            totalProjects: true,
            languages: true,
            siteDays: true,
        },
    },
};
