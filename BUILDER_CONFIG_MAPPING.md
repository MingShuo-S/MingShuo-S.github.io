# Builder 配置项 - 代码映射表

> 这个文档将 `scripts/builder.config.js` 中的每个配置项映射到 `scripts/builder.js` 中的实际使用位置，帮助理解配置的影响范围。

---

## 快速查找表

| 配置分类 | 配置项 | builder.js 位置 | 影响功能 |
|---------|--------|-----------------|---------|
| **目录配置** | `directories.source` | 第 9-22 行 | 模板、数据、资源查找 |
| | `directories.finalOutput` | 第 11 行 | 最终网站输出目录 |
| | `directories.tempOutput` | 第 13 行 | 临时构建目录 |
| | `directories.templates` | 第 19、283 行 | 模板文件查找 |
| | `directories.data` | 第 20、137 行 | 配置和数据文件查找 |
| | `directories.assets` | 第 21、1350 行 | 资源文件复制 |
| **Obsidian** | `obsidian.enabled` | 第 27 行 | 文章读取模式切换 |
| | `obsidian.repositoryPath` | 第 25 行 | Obsidian 库位置 |
| **日期处理** | `dates.defaultFormat` | 第 200-230 行 | 文件名和 Front Matter 日期解析 |
| | `dates.displayFormat` | 第 223-225 行 | 网页显示日期格式 |
| | `dates.siteStartDate` | 第 700 行 | 首页"网站运营天数"计算 |
| **路径转换** | `paths.article.relativePrefix` | 第 600-620 行 | 文章页面资源路径 |
| | `paths.publicPage.relativePrefix` | 第 755-770 行 | 列表页资源路径 |
| | `paths.root.addPublicPrefix` | 第 700-710 行 | 根目录首页 /public 前缀 |
| **页面配置** | `pages.home.latestArticlesCount` | 第 680 行 | 首页显示文章数 |
| | `pages.home.featuredProjectsCount` | 第 690 行 | 首页显示项目数 |
| | `pages.tags.sortBy` | 第 800-820 行 | 标签排序方式 |
| | `pages.rss.maxItems` | 第 1280 行 | RSS 最大文章数 |
| **文章处理** | `articles.frontMatter.defaultTags` | 第 165 行 | 默认标签 |
| | `articles.markdown.highlight` | 第 165-195 行 | 代码高亮 |
| | `articles.datePattern` | 第 200-230 行 | 文件名日期位置 |

---

## 详细映射

### 1. 目录配置 (`directories`)

#### 源代码目录 (`source`)
```javascript
// builder.config.js
directories: {
    source: path.join(PROJECT_ROOT, 'src'),
}

// builder.js 对应位置 (第 9 行)
this.sourceDir = path.join(__dirname, '..', 'src');
```

**用途**：所有模板、数据、资源的根目录

---

#### 最终输出目录 (`finalOutput`)
```javascript
// builder.config.js
directories: {
    finalOutput: path.join(PROJECT_ROOT, 'public'),
}

// builder.js 对应位置 (第 11 行)
this.finalOutputDir = path.join(__dirname, '..', 'public');

// builder.js 使用位置
// 第 1340-1360 行：replaceFinalOutput() 方法
// 作用：GitHub Pages 部署的网站目录
```

**⚠️ 警告**：修改此项会破坏 GitHub Pages 部署！

---

#### 临时输出目录 (`tempOutput`)
```javascript
// builder.config.js
directories: {
    tempOutput: path.join(PROJECT_ROOT, '.temp_public'),
}

// builder.js 对应位置 (第 13 行)
this.tempOutputDir = path.join(__dirname, '..', '.temp_public');

// builder.js 使用位置
// 第 32 行：prepareTempDir() 方法
// 第 88 行：cleanupTempDir() 方法
```

**作用**：构建过程中的临时位置，构建完成后会替换最终输出目录

---

#### 模板目录 (`templates`)
```javascript
// builder.js 使用位置（第 19、283 行等）
const templateFile = path.join(this.templateDir, 'article.html');

// 涉及的文件：
src/templates/
├── index.html
├── article.html
├── about.html
├── projects.html
├── tags.html
├── writings.html
├── archive.html
├── category-archive.html
└── partials/
    ├── navbar.html
    ├── footer.html
    ├── article-card.html
    ├── project-card.html
    └── ...
```

---

#### 数据目录 (`data`)
```javascript
// builder.js 使用位置（第 20、137 行）
const configFile = path.join(this.dataDir, 'config.json');

// 涉及的文件：
src/data/
├── config.json      # 网站配置
├── projects.json    # 项目列表
├── friends.json     # 友情链接
├── tags.json        # 标签配置
└── about.json       # 关于页数据
```

---

#### 资源目录 (`assets`)
```javascript
// builder.js 使用位置（第 21、1350 行）
await fs.copy(this.assetsDir, destAssetsDir);

// 涉及的文件：
src/assets/
├── css/
│   ├── style.css
│   ├── article.css
│   ├── projects.css
│   └── ...
├── js/
│   ├── main.js
│   ├── about.js
│   └── ...
└── images/
    ├── avatar.jpg
    └── ...
```

---

### 2. Obsidian 集成配置 (`obsidian`)

#### Obsidian 库路径 (`repositoryPath`)
```javascript
// builder.config.js
obsidian: {
    repositoryPath: 'C:\\Users\\29548\\Documents\\Sunshine\\ANOTES',
}

// builder.js 对应位置 (第 25 行)
this.obsidianDir = 'C:\\Users\\29548\\Documents\\Sunshine\\ANOTES';

// builder.js 使用位置
// 第 130-135 行：processArticles() 方法中
// if (this.useObsidianMode) {
//     articleDir = this.obsidianDir;
// }
```

**用途**：指定 Obsidian 笔记库的本地路径，builder 会从这里递归读取所有 markdown 文件

---

#### 启用 Obsidian 模式 (`enabled`)
```javascript
// builder.config.js
obsidian: {
    enabled: true,
}

// builder.js 对应位置 (第 27 行)
this.useObsidianMode = true;

// builder.js 使用位置
// 第 130-135 行：processArticles() 方法
// if (this.useObsidianMode) {
//     // 从 Obsidian 库读取
// } else {
//     // 从 src/data/articles 读取
// }
```

**true 时的行为**：从 `repositoryPath` 指定的 Obsidian 库读取所有 markdown
**false 时的行为**：从 `src/data/articles/` 读取 markdown 文件

---

#### 忽略文件夹 (`ignoreFolders`)
```javascript
// builder.config.js
obsidian: {
    ignoreFolders: ['_', '.'],
}

// builder.js 对应位置
// 第 155 行：在递归读取文件时检查文件夹名称
// if (item.name.startsWith('_') || item.name.startsWith('.')) {
//     continue; // 跳过
// }
```

**用途**：防止读取特定文件夹，如草稿 (`_draft/`) 或隐藏文件夹 (`.obsidian/`)

---

#### 分类来源 (`categorySource`)
```javascript
// builder.config.js
obsidian: {
    categorySource: 'folder',
}

// builder.js 对应位置
// 第 185 行：extractCategoryFromPath() 方法
// 根据文件所在文件夹确定文章分类

// 实际代码 (第 185-200 行)
extractCategoryFromPath(relativePath) {
    const dirPath = path.dirname(relativePath);
    const folders = dirPath.split('/');
    const validFolders = folders.filter(folder => !folder.startsWith('_'));
    return validFolders[validFolders.length - 1] || '未分类';
}
```

**'folder'**：使用文件所在文件夹名作为分类
```
ANOTES/
├── AI写的/
│   └── article.md → 分类：AI写的
├── 学生活动/
│   └── article.md → 分类：学生活动
```

**'frontmatter'**：使用 article.md 中的 category 字段
```
---
category: 技术笔记
---
```

---

### 3. 日期处理配置 (`dates`)

#### 默认日期格式 (`defaultFormat`)
```javascript
// builder.config.js
dates: {
    defaultFormat: 'YYYY-MM-DD',
}

// builder.js 使用位置
// 第 200-210 行：extractDateFromFilename() 方法
// 用正则表达式解析文件名中的日期

// 实际代码示例
const dateMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
```

**支持的格式**：
- `'YYYY-MM-DD'` - 2026-05-03
- `'YYYY/MM/DD'` - 2026/05/03
- `'MMDDYYYY'` - 05032026

---

#### 显示日期格式 (`displayFormat`)
```javascript
// builder.config.js
dates: {
    displayFormat: 'YYYY年MM月DD日',
}

// builder.js 对应位置
// 第 223 行：formatDate() 方法
formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00Z');
    // 转换为目标格式
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
```

**用处**：
- 首页显示 `2026年5月3日`
- 文章页显示 `2026年5月3日`
- 列表页显示 `2026年5月3日`

**输出示例**：
```javascript
displayFormat: 'YYYY年MM月DD日'    → 2026年5月3日
displayFormat: 'MMM DD, YYYY'     → May 03, 2026
displayFormat: 'DD/MM/YYYY'       → 03/05/2026
```

---

#### 网站成立日期 (`siteStartDate`)
```javascript
// builder.config.js
dates: {
    siteStartDate: '2025-01-01',
}

// builder.js 使用位置
// 第 700 行：generateHomePage() 方法
const siteDays = this.calculateSiteDays('2025-01-01');

// 实际代码 (第 1400+ 行)
calculateSiteDays(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}
```

**用途**：在首页显示"网站已运营 X 天"的统计

---

#### Atom/RSS 日期格式 (`atomFormat`)
```javascript
// builder.config.js
dates: {
    atomFormat: 'YYYY-MM-DDTHH:mm:ssZ',
}

// builder.js 使用位置
// 第 1280 行：generateRSSFeed() 方法中
// 用于生成 RSS 订阅源中的日期

// RSS 中的实际格式
<pubDate>2026-05-03T10:30:00Z</pubDate>
```

**作用**：RSS 阅读器需要标准的 ISO 8601 格式

---

### 4. 路径相对性配置 (`paths`)

#### 文章页面路径 (`paths.article`)
```javascript
// builder.config.js
paths: {
    article: {
        relativePrefix: '../../',
        depth: 3,
    },
}

// builder.js 使用位置
// 第 600-620 行：generateArticlePage() 方法中

// 代码示例 (第 615-620 行)
html = html.replace(/(href|src)="\/assets\//g, '$1="../../assets/');
html = html.replace(/href="\/writings"/g, 'href="../../writings"');
```

**路径转换规则**：
```
页面位置：/posts/article-slug/index.html (深度3层)

原始链接              转换后链接
/assets/css/*    →    ../../assets/css/*
/writings        →    ../../writings
/posts/*         →    ../../posts/*
/about           →    ../../about
```

---

#### 公共页面路径 (`paths.publicPage`)
```javascript
// builder.config.js
paths: {
    publicPage: {
        relativePrefix: '../',
        depth: 2,
    },
}

// builder.js 使用位置
// 第 755-770 行：各列表页面生成函数中

// 代码示例 (writings 页 第 755 行)
html = html.replace(/(href|src)="\/assets\//g, '$1="../assets/');
```

**适用页面**：
- `/writings/` - 文章列表
- `/tags/` - 标签页
- `/projects/` - 项目页
- `/about/` - 关于页

**路径转换规则**：
```
页面位置：/writings/index.html (深度2层)

原始链接              转换后链接
/assets/css/*    →    ../assets/css/*
/posts/slug      →    ../posts/slug
/about           →    ../about
```

---

#### 根目录首页路径 (`paths.root`)
```javascript
// builder.config.js
paths: {
    root: {
        relativePrefix: '/',
        addPublicPrefix: true,
    },
}

// builder.js 使用位置
// 第 700-710 行：generateHomePage() 方法中

// 代码示例 (第 705-710 行)
html = html.replace(/href="(?!https?:\/\/)(?!\/\/)(?!#)(?!mailto:)(?!tel:)(?!\/")([^"]+)"/g, 'href="/public$1"');
```

**GitHub Pages 特殊处理**：
```javascript
addPublicPrefix: true 时的转换：

原始链接              转换后链接
/assets/css/*    →    /public/assets/css/*
/writings        →    /public/writings
<href="/"/>      →    <href="/public/"/>
```

**为什么需要 addPublicPrefix**：
- 本地：`file:///path/to/index.html` 可以正常访问 `/assets/`
- GitHub Pages：域名是 `mingshuo-s.github.io`，`public` 是网站根目录
  - 本地访问时需要 `/public/assets/`
  - 部署后 GitHub Pages 自动将 `public` 作为根目录

---

### 5. 页面生成配置 (`pages`)

#### 首页文章数 (`pages.home.latestArticlesCount`)
```javascript
// builder.config.js
pages: {
    home: {
        latestArticlesCount: 3,
    }
}

// builder.js 使用位置
// 第 680 行：generateHomePage() 方法中

// 代码 (第 680-685 行)
const latestArticles = articles.slice(0, 3);  // ← 这里使用配置值
```

**影响**：
```html
<!-- 首页生成的 HTML -->
<div class="articles-grid" id="articlesGrid">
    <!-- 显示最新 3 篇文章卡片 -->
</div>
```

---

#### 首页项目数 (`pages.home.featuredProjectsCount`)
```javascript
// builder.config.js
pages: {
    home: {
        featuredProjectsCount: 2,
    }
}

// builder.js 使用位置
// 第 690 行：generateHomePage() 方法中

// 代码 (第 690-695 行)
const featuredProjects = projects
    .filter(p => p.featured)
    .slice(0, 2);  // ← 这里使用配置值
```

**影响**：只显示 `featured: true` 的项目中的前 2 个

---

#### 标签排序方式 (`pages.tags.sortBy`)
```javascript
// builder.config.js
pages: {
    tags: {
        sortBy: 'count',           // 或 'name'
        sortDescending: true,
    }
}

// builder.js 使用位置
// 第 800-820 行：generateTagsPage() 方法中

// 代码 (第 810-815 行)
const tags = Array.from(articleTagMap.entries())
    .map(([name, data]) => ({ ... }))
    .sort((a, b) => {
        if (sortBy === 'count') {
            return b.totalCount - a.totalCount;  // 按文章数排序
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);  // 按名字排序
        }
    });
```

**'count' (按文章数)**：
```
JavaScript (45篇)
Python (32篇)
Node.js (28篇)
```

**'name' (按字母)**：
```
JavaScript
Node.js
Python
```

---

#### RSS 最大文章数 (`pages.rss.maxItems`)
```javascript
// builder.config.js
pages: {
    rss: {
        maxItems: 0,  // 0 表示所有
    }
}

// builder.js 使用位置
// 第 1280 行：generateRSSFeed() 方法中

// 代码 (第 1280-1285 行)
let feedItems = articles;
if (maxItems > 0) {
    feedItems = articles.slice(0, maxItems);
}
```

**maxItems 取值**：
- `0` - 包含所有文章
- `10` - 只包含最新 10 篇文章
- `50` - 只包含最新 50 篇文章

---

### 6. 文章处理配置 (`articles`)

#### 默认标签 (`articles.frontMatter.defaultTags`)
```javascript
// builder.config.js
articles: {
    frontMatter: {
        defaultTags: [],  // 或 ['JavaScript', 'Blog']
    }
}

// builder.js 使用位置
// 第 165 行：processArticles() 方法中

// 代码 (第 165-168 行)
const allTags = frontmatter.tags || [];
// 如果文章 Front Matter 中没有 tags，则使用 defaultTags
```

**用途**：当 markdown 文件的 Front Matter 中没有 `tags` 字段时，使用这个默认值

---

#### 自动生成摘要 (`articles.frontMatter.autoGenerateSummary`)
```javascript
// builder.config.js
articles: {
    frontMatter: {
        autoGenerateSummary: false,  // 或 true
        summaryLength: 150,
    }
}

// builder.js 使用位置
// 第 168-175 行：processArticles() 方法中

// 代码示例
if (!article.summary && autoGenerateSummary) {
    article.summary = article.content
        .substring(0, summaryLength)
        .replace(/<[^>]*>/g, '');  // 移除 HTML 标签
}
```

**false (推荐)**：使用 Front Matter 中的 summary 字段
```yaml
---
title: 文章标题
summary: 这是文章的摘要，会显示在列表页
---
```

**true**：自动从文章内容中截取
```javascript
// 自动截取前 150 个字
summary: "文章内容的前 150 个字符作为摘要..."
```

---

#### 阅读时间计算 (`articles.frontMatter.wordsPerMinute`)
```javascript
// builder.config.js
articles: {
    frontMatter: {
        wordsPerMinute: 200,
    }
}

// builder.js 使用位置
// 第 180 行：processArticles() 方法中

// 代码 (第 180-185 行)
const wordCount = markdown.split(/\s+/).length;
const readTime = Math.ceil(wordCount / 200);  // ← 这里使用配置值
```

**计算例子**：
```
wordsPerMinute: 200
文章字数: 2000

阅读时间 = 2000 / 200 = 10 分钟
```

**不同读者的设置**：
- `150` - 快速读者或英文
- `200` - 普通中文读者（推荐）
- `250` - 仔细阅读者

---

#### 日期提取位置 (`articles.datePattern`)
```javascript
// builder.config.js
articles: {
    datePattern: 'prefix',  // 或 'suffix'
}

// builder.js 使用位置
// 第 200-210 行：extractDateFromFilename() 方法中

// 代码示例
if (datePattern === 'prefix') {
    // 匹配 2026-05-03-article-title.md
    return fileName.match(/^(\d{4}-\d{2}-\d{2})/)[0];
} else {
    // 匹配 article-title-2026-05-03.md
    return fileName.match(/(\d{4}-\d{2}-\d{2})\.md$/)[0];
}
```

**'prefix' 模式**：
```
ANOTES/
├── 2026-05-03-article1.md
├── 2026-05-02-article2.md
```

**'suffix' 模式**：
```
ANOTES/
├── article1-2026-05-03.md
├── article2-2026-05-02.md
```

---

#### Markdown 渲染选项 (`articles.markdown`)
```javascript
// builder.config.js
articles: {
    markdown: {
        highlight: true,
        tables: true,
        strikethrough: true,
        taskLists: true,
        addHeadingIds: true,
    }
}

// builder.js 使用位置
// 第 165-195 行：marked 库的配置

// 代码 (第 165-175 行)
marked.setOptions({
    highlight: options.highlight ? highlightCode : null,
    breaks: true,
    pedantic: false,
    gfm: true,  // GitHub Flavored Markdown
});
```

**各选项说明**：

| 选项 | 禁用后的效果 |
|-----|-----------|
| `highlight: true` | 代码块不会显示语法高亮 |
| `tables: true` | Markdown 表格无法渲染 |
| `strikethrough: true` | `~~删除线~~` 无法渲染 |
| `taskLists: true` | `- [ ] 任务` 无法渲染 |
| `addHeadingIds: true` | 标题没有锚点，无法生成目录 |

---

### 7. 项目配置 (`projects`)

#### 项目数据文件 (`projects.dataFile`)
```javascript
// builder.config.js
projects: {
    dataFile: 'src/data/projects.json',
}

// builder.js 使用位置
// 第 690 行：generateHomePage() 和 generateTagsPage() 中

// 代码
const projectsFile = path.join(this.dataDir, 'projects.json');
const projectsData = await fs.readJson(projectsFile);
```

**文件格式**：
```json
{
    "projects": [
        {
            "title": "RemUp",
            "featured": true,
            "status": "developing",
            "tags": ["笔记工具", "VSCode插件"],
            "github": "MingShuo-S/RemUp",
            "url": "../../remup"
        }
    ]
}
```

---

#### 项目排序方式 (`projects.sortBy`)
```javascript
// builder.config.js
projects: {
    sortBy: 'date',  // 或 'name' 或 'stars'
    sortDescending: true,
}

// builder.js 使用位置
// 第 910-930 行：generateProjectsPage() 方法中

// 排序逻辑
if (sortBy === 'date') {
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));
} else if (sortBy === 'name') {
    projects.sort((a, b) => a.title.localeCompare(b.title));
} else if (sortBy === 'stars') {
    projects.sort((a, b) => b.stars - a.stars);
}
```

---

## 配置优先级

当存在多个配置来源时，优先级顺序为：

1. **命令行参数**（如果 builder.js 支持）→ 最高优先级
2. **环境变量**（如果 builder.js 支持）
3. **builder.config.js**（推荐）
4. **src/data/config.json**（网站元数据）
5. **builder.js 中的硬编码值** → 最低优先级

---

## 配置验证检查表

在修改配置后，运行构建前请检查：

- [ ] `obsidian.repositoryPath` 是否指向存在的目录
- [ ] 所有文件名是否符合 `articles.datePattern` 指定的格式
- [ ] `dates.displayFormat` 是否使用有效的日期格式
- [ ] `pages.home.latestArticlesCount` 不超过现有文章数
- [ ] `pages.rss.maxItems` 的值 >= 0
- [ ] `articles.markdown` 中的选项确实支持项目使用的语法
- [ ] `projects.sortBy` 是否为 'date' / 'name' / 'stars' 之一

---

## 下一步：集成到 builder.js

要将 builder.config.js 集成到 builder.js，需要：

1. 在 builder.js 顶部添加：
   ```javascript
   const config = require('./builder.config.js');
   ```

2. 在 SafeSiteBuilder 构造函数中：
   ```javascript
   constructor(customConfig = {}) {
       this.config = { ...config, ...customConfig };
       this.sourceDir = this.config.directories.source;
       this.obsidianDir = this.config.obsidian.repositoryPath;
       // ... 等等
   }
   ```

3. 在需要用到配置的地方使用 `this.config` 而不是硬编码值

这样修改后，你可以轻松扩展构建功能，而无需直接修改 builder.js 的核心逻辑。

