# Builder 配置指南

> 本文档详细说明 `scripts/builder.config.js` 中所有配置项的含义、用法和影响范围。

## 目录
1. [快速开始](#快速开始)
2. [配置项详解](#配置项详解)
3. [常见场景](#常见场景)
4. [故障排查](#故障排查)

---

## 快速开始

### 配置文件位置
```
scripts/builder.config.js
```

### 如何使用配置
builder.js 已经集成这个配置文件。现在你可以直接修改 `scripts/builder.config.js`，它会控制目录、数据文件路径和页面行为。

如果你要扩展 `src/data/` 里的 JSON 文件，优先把路径加到 `dataFiles` 里，这样 builder.js 不需要再写死文件名。

### 修改配置后需要重新构建
```bash
npm run build
# 或
node scripts/builder.js
```

---

## 配置项详解

### 1. 目录配置 (`directories`)

**用途**：定义项目中各类文件的存储位置

#### 1.1 主要目录

```javascript
directories: {
    source: 'src',
    finalOutput: 'public',
    tempOutput: '.temp_public',
    root: '.',  // 项目根目录
}
```

| 配置项 | 说明 | 例子 | 修改影响 |
|--------|------|------|---------|
| `source` | 源代码目录 | `src/` | 模板、数据、资源的查找位置 |
| `finalOutput` | 最终输出目录 | `public/` | **⚠️ 修改会破坏 GitHub Pages 部署** |
| `tempOutput` | 临时构建目录 | `.temp_public/` | 构建中间过程的位置，可安全修改 |
| `root` | 项目根目录 | `.` | 主页 index.html 的输出位置 |

#### 1.2 子目录

```javascript
templates: 'src/templates'    // HTML 模板位置
data: 'src/data'              // 配置数据位置（config.json 等）
assets: 'src/assets'          // CSS、JS、图片位置
```

**重要**：这些路径是自动从 `source` 目录派生的，通常不需要修改。

#### 1.3 数据文件路径 (`dataFiles`)

`dataFiles` 用来描述 `src/data/` 下具体 JSON 文件和文章目录的位置：

```javascript
dataFiles: {
    siteConfig: 'src/data/config.json',
    about: 'src/data/about.json',
    projects: 'src/data/projects.json',
    friends: 'src/data/friends.json',
    tags: 'src/data/tags.json',
    articlesDir: 'src/data/articles',
}
```

| 配置项 | 说明 | 影响 |
|--------|------|------|
| `siteConfig` | 站点元信息 JSON | `site`、`social`、`features`、`projects` 等全局配置 |
| `about` | 关于页数据 | 关于页内容渲染 |
| `projects` | 项目列表数据 | 首页精选项目、项目页、标签页 |
| `friends` | 友情链接数据 | 首页友情链接模块 |
| `tags` | 标签数据 | 如果未来把标签配置外置，可以直接复用 |
| `articlesDir` | 非 Obsidian 模式文章目录 | 从本地文章源读取 |

**建议**：如果你只是改内容，不要改路径；如果你改了 JSON 文件名，先改这里，再检查 builder.js 是否还有旧路径引用。

---

### 2. Obsidian 集成配置 (`obsidian`)

**用途**：配置从 Obsidian 笔记库读取文章的方式

#### 2.1 核心配置

```javascript
obsidian: {
    repositoryPath: 'C:\\Users\\29548\\Documents\\Sunshine\\ANOTES',
    enabled: true,
    ignoreFolders: ['_', '.'],
    categorySource: 'folder',
}
```

| 配置项 | 说明 | 可选值 | 修改影响 |
|--------|------|--------|---------|
| `repositoryPath` | Obsidian 库的本地路径 | 任意本地路径 | 决定从哪里读取 markdown 文件 |
| `enabled` | 是否启用 Obsidian 模式 | `true` / `false` | false 时从 src/data/articles 读取 |
| `ignoreFolders` | 要跳过的文件夹前缀 | 数组 | 可防止读取草稿或备份文件夹 |
| `categorySource` | 分类来源 | `'folder'` / `'frontmatter'` | 控制文章所属分类如何确定 |

#### 2.2 常见场景

**场景 1：切换到本地 src/data/articles 文件夹**
```javascript
enabled: false  // 关闭 Obsidian 模式
```

**场景 2：从不同的 Obsidian 库读取**
```javascript
repositoryPath: 'C:\\Users\\yourname\\Documents\\MyVault',
```

**场景 3：使用 Front Matter 作为分类而不是文件夹名**
```javascript
categorySource: 'frontmatter',
```

---

### 3. 日期处理配置 (`dates`)

**用途**：统一项目中日期的格式和解析方式

#### 3.1 配置项

```javascript
dates: {
    defaultFormat: 'YYYY-MM-DD',
    displayFormat: 'YYYY年MM月DD日',
    siteStartDate: '2025-01-01',
    atomFormat: 'YYYY-MM-DDTHH:mm:ssZ',
}
```

| 配置项 | 说明 | 例子 | 用处 |
|--------|------|------|------|
| `defaultFormat` | 文件名和 Front Matter 中的日期格式 | `'2026-05-03-article.md'` | 用于解析文章日期 |
| `displayFormat` | 网页显示的日期格式 | `2026年5月3日` | 影响所有页面上显示的日期 |
| `siteStartDate` | 网站成立日期 | `'2025-01-01'` | 用于计算首页的"网站运营天数" |
| `atomFormat` | RSS 和 Atom 源的日期格式 | `'2026-05-03T10:30:00Z'` | 只影响 RSS 订阅源 |

#### 3.2 支持的日期格式

```
YYYY    - 4位年份
MM      - 2位月份 (01-12)
DD      - 2位日期 (01-31)
HH      - 小时 (00-23)
mm      - 分钟 (00-59)
ss      - 秒 (00-59)
Z       - 时区 (Z 表示 UTC)
```

#### 3.3 修改影响

```javascript
// ❌ 错误：修改 defaultFormat 但旧文章名没有改变
defaultFormat: 'MM/DD/YYYY',  // 新设置
// 结果：旧的 '2026-05-03-article.md' 无法被正确解析

// ✅ 正确：确保所有文章名符合该格式
// 或者同时修改现有文章名
```

---

### 4. 路径相对性配置 (`paths`)

**用途**：处理不同页面位置对资源路径的影响

#### 4.1 理解页面深度

生成的网站结构：
```
/index.html                          ← 深度1 (根目录)
/writings/index.html                 ← 深度2 (列表页)
/tags/index.html                     ← 深度2 (列表页)
/posts/{slug}/index.html             ← 深度3 (文章页)
```

#### 4.2 配置说明

```javascript
paths: {
    article: {
        relativePrefix: '../../',
        depth: 3,
    },
    publicPage: {
        relativePrefix: '../',
        depth: 2,
    },
    root: {
        relativePrefix: '/',
        depth: 1,
        addPublicPrefix: true,
    },
}
```

#### 4.3 相对路径计算

**例子 1：文章页面中的资源链接**
```
位置：/posts/my-article/index.html (深度3)
原始链接：/assets/css/style.css
转换后：../../assets/css/style.css
```

**例子 2：列表页面中的资源链接**
```
位置：/writings/index.html (深度2)
原始链接：/assets/css/style.css
转换后：../assets/css/style.css
```

**例子 3：根目录首页**
```
位置：/index.html (深度1)
原始链接：/assets/css/style.css
转换后：/public/assets/css/style.css (需要 /public 前缀)
```

#### 4.4 `addPublicPrefix` 的作用

GitHub Pages 将 `public` 文件夹作为网站根目录部署，所以根目录的 index.html 需要特殊处理：

```javascript
// 不加前缀时（本地 open index.html）
<link rel="stylesheet" href="/assets/css/style.css">

// 加前缀后（GitHub Pages 上）
<link rel="stylesheet" href="/public/assets/css/style.css">
```

---

### 5. 页面生成配置 (`pages`)

**用途**：控制各个页面的内容和行为

#### 5.1 首页配置

```javascript
home: {
    latestArticlesCount: 3,      // 显示最新 3 篇文章
    featuredProjectsCount: 2,    // 显示精选 2 个项目
    includeFriendsSection: true, // 显示友情链接
}
```

**修改影响**：
- 增加 `latestArticlesCount` → 首页显示更多文章
- 减少 `featuredProjectsCount` → 首页项目部分更紧凑

#### 5.2 标签页配置

```javascript
tags: {
    sortBy: 'count',       // 按文章数排序 ('name' 按字母)
    sortDescending: true,  // 降序 (文章数最多的在前)
}
```

**修改影响**：
- `sortBy: 'name'` → 标签按字母顺序排列
- `sortDescending: false` → 反转排序顺序

#### 5.3 RSS 订阅配置

```javascript
rss: {
    title: "Sunshine's Blog",
    description: "记录技术思考、项目经验和学习成长",
    maxItems: 0,  // 0 表示包含所有文章
}
```

#### 5.4 站点地图配置

```javascript
sitemap: {
    includeArticles: true,
    includePages: true,
    articlePriority: 'high',    // 搜索引擎优先级
    pagePriority: 'medium',
}
```

---

### 6. 文章处理配置 (`articles`)

**用途**：控制文章的解析、显示和生成方式

#### 6.1 Front Matter 默认值

```javascript
frontMatter: {
    defaultTags: [],           // 没有指定 tags 时使用
    autoGenerateSummary: false, // 自动从内容截取摘要
    summaryLength: 150,        // 摘要长度（字符数）
    wordsPerMinute: 200,       // 阅读时间计算速度
}
```

#### 6.2 日期提取方式

```javascript
datePattern: 'prefix',  // 'prefix' 或 'suffix'
autoAddDate: true,      // 自动为没有日期的文章添加当前日期
```

**例子**：
```bash
# prefix 模式
2026-05-03-my-article.md

# suffix 模式
my-article-2026-05-03.md
```

#### 6.3 Markdown 渲染选项

```javascript
markdown: {
    highlight: true,      // 代码语法高亮
    tables: true,         // 支持 Markdown 表格
    strikethrough: true,  // 支持 ~~删除线~~
    taskLists: true,      // 支持 - [ ] 任务列表
    addHeadingIds: true,  // 为标题自动添加 ID
}
```

**修改影响**：
- 关闭任何一个可能影响 Markdown 渲染效果
- 例如 `highlight: false` → 代码块不会高亮显示

---

### 7. 项目数据配置 (`projects`)

**用途**：控制项目展示和排序

```javascript
projects: {
    dataFile: 'src/data/projects.json',  // 项目数据来源
    showFilters: true,                   // 显示筛选器
    sortBy: 'date',                      // 排序方式
    sortDescending: true,                // 降序
}
```

| sortBy 选项 | 说明 |
|------------|------|
| `'date'` | 按添加日期排序 |
| `'name'` | 按项目名字排序 |
| `'stars'` | 按 GitHub stars 数排序 |

---

### 8. 缓存配置 (`cache`)

**用途**：优化构建速度

```javascript
cache: {
    enableTemplateCache: true,  // ✅ 推荐启用
    enableDataCache: false,     // ⚠️ 可能导致数据过期
    expireTime: 0,              // 0 表示不过期
}
```

**建议**：
- 开发时可关闭缓存，便于看到实时变化
- 生产构建时启用缓存以加快速度

---

### 9. 调试配置 (`debug`)

**用途**：辅助开发和故障排查

```javascript
debug: {
    verbose: false,           // 详细日志（可能输出很多）
    keepTempFiles: false,    // 保留临时文件用于调试
    logPathTransforms: false, // 输出路径转换过程
    logGeneratedFiles: true,  // 输出生成的每个文件
}
```

**调试时推荐设置**：
```javascript
debug: {
    verbose: true,
    keepTempFiles: true,
    logPathTransforms: true,
}
```

---

### 10. 输出优化配置 (`optimization`)

**用途**：优化最终生成的 HTML/CSS/JS 大小

```javascript
optimization: {
    minifyHtml: false,   // 压缩 HTML
    minifyCss: false,    // 压缩 CSS
    minifyJs: false,     // 压缩 JavaScript
}
```

**注意**：压缩可能会增加构建时间，建议只在生产环境启用。

---

### 11. 统计和元数据配置 (`metadata`)

**用途**：控制自动生成的元数据

```javascript
metadata: {
    generateStats: true,   // 生成统计信息（文章数、总字数等）
    generateSitemap: true, // 生成 sitemap.xml
    generateRss: true,     // 生成 rss.xml
    stats: {
        totalArticles: true,
        totalWords: true,
        totalProjects: true,
        languages: true,
        siteDays: true,
    },
}
```

---

## 常见场景

### 场景 1：在本地快速测试（使用本地文件而不是 Obsidian）

```javascript
obsidian: {
    enabled: false,  // 关闭 Obsidian 模式
}
```

### 场景 2：改变首页显示的文章数量

```javascript
pages: {
    home: {
        latestArticlesCount: 5,  // 从 3 改为 5
    }
}
```

### 场景 3：按字母顺序而不是文章数排序标签

```javascript
pages: {
    tags: {
        sortBy: 'name',          // 从 'count' 改为 'name'
        sortDescending: false,   // 升序排列
    }
}
```

### 场景 4：为新的 Obsidian 库更改路径

```javascript
obsidian: {
    repositoryPath: 'D:\\Projects\\MyVault\\NOTES',
}
```

### 场景 5：更改日期显示格式

```javascript
dates: {
    displayFormat: 'MMM DD, YYYY',  // 从 '5月3日' 改为 'May 03, 2026'
}
```

### 场景 6：禁用某些 Markdown 功能

```javascript
articles: {
    markdown: {
        strikethrough: false,  // 禁用删除线
        taskLists: false,      // 禁用任务列表
    }
}
```

---

## 故障排查

### 问题 1：文章无法被读取

**检查清单**：
1. ✅ `obsidian.enabled` 是否为 `true`
2. ✅ `obsidian.repositoryPath` 是否正确且存在
3. ✅ 文件夹名称是否在 `ignoreFolders` 中
4. ✅ markdown 文件名是否符合 `articles.datePattern` 指定的格式

### 问题 2：链接错误（404）

**检查清单**：
1. ✅ `paths` 配置中的 `relativePrefix` 是否正确
2. ✅ 资源文件是否真的存在于 `assets` 目录中
3. ✅ 页面的实际深度是否与配置匹配

### 问题 3：日期显示不正确

**检查清单**：
1. ✅ `dates.displayFormat` 是否设置正确
2. ✅ 文件名中的日期是否符合 `dates.defaultFormat`
3. ✅ Front Matter 中的 date 字段格式是否一致

### 问题 4：构建速度慢

**优化方案**：
1. 启用 `cache.enableTemplateCache: true`
2. 关闭 `debug.verbose: true`
3. 减少 `pages.home.latestArticlesCount` 等数值
4. 关闭 `metadata.generateStats: true` (如果不需要)

### 问题 5：临时文件没有被清理

**解决方案**：
```javascript
debug: {
    keepTempFiles: false,  // 改为 false 自动清理
}
```

---

## 最佳实践

### 1. 环境差异化配置

```javascript
// 开发环境
if (process.env.NODE_ENV === 'development') {
    debug.verbose = true;
    cache.enableTemplateCache = false;
}

// 生产环境
if (process.env.NODE_ENV === 'production') {
    optimization.minifyHtml = true;
    cache.enableTemplateCache = true;
}
```

### 2. 定期备份配置

```bash
# 备份当前配置
cp scripts/builder.config.js scripts/builder.config.backup.js
```

### 3. 使用 git 跟踪配置变化

```bash
git add scripts/builder.config.js
git commit -m "Update builder config: change articles count from 3 to 5"
```

### 4. 在修改配置前先测试

```bash
# 修改前
npm run build

# 对比生成结果
diff -r public/.backup public/

# 如果有问题，恢复配置
git checkout scripts/builder.config.js
```

---

## 集成 builder.js 的下一步

目前 builder.js 还没有读取这个配置文件。下一步应该：

1. **在 builder.js 顶部导入配置**
   ```javascript
   const config = require('./builder.config.js');
   ```

2. **使用配置替换硬编码值**
   ```javascript
   // 改前
   this.obsidianDir = 'C:\\Users\\29548\\Documents\\Sunshine\\ANOTES';
   
   // 改后
   this.obsidianDir = config.obsidian.repositoryPath;
   ```

3. **在构造函数中初始化**
   ```javascript
   constructor(customConfig = {}) {
       const finalConfig = { ...config, ...customConfig };
       this.config = finalConfig;
       // 使用 this.config.directories.source 等
   }
   ```

---

## 相关文件

- **配置文件**：`scripts/builder.config.js`
- **主构建脚本**：`scripts/builder.js`
- **网站配置**：`src/data/config.json` (补充配置)
- **项目数据**：`src/data/projects.json`
- **模板目录**：`src/templates/`

