# Builder 配置系统 - 快速入门

## 📋 文件说明

本项目提供了完整的 builder 配置管理系统，包含以下文件：

### 1. `scripts/builder.config.js`
**配置文件本体** - 包含所有可配置项和详细注释

```javascript
// 快速修改示例
module.exports = {
    obsidian: {
        repositoryPath: 'C:\\...\\ANOTES',
        enabled: true,
    },
    pages: {
        home: {
            latestArticlesCount: 3,
            featuredProjectsCount: 2,
        }
    },
    // ... 更多配置
}
```

### 2. `BUILDER_CONFIG_GUIDE.md`
**完整文档** - 详细说明每个配置的含义、用途和常见场景

### 3. `BUILDER_CONFIG_MAPPING.md`
**代码映射表** - 说明每个配置对应 builder.js 中的哪些代码

---

## 🚀 快速开始

### 第 1 步：查看当前配置
打开 `scripts/builder.config.js`，参考其中的注释理解各配置项

### 第 2 步：查找你需要的配置
根据需求查看对应的配置类别：

| 需求 | 配置类别 | 配置项 |
|-----|---------|--------|
| 改变文章来源 | Obsidian | `obsidian.repositoryPath` |
| 改变数据 JSON 路径 | 数据文件 | `dataFiles.*` |
| 改变显示日期格式 | 日期处理 | `dates.displayFormat` |
| 改变首页文章数 | 页面生成 | `pages.home.latestArticlesCount` |
| 改变标签排序 | 页面生成 | `pages.tags.sortBy` |
| 调整 Markdown 语法支持 | 文章处理 | `articles.markdown.*` |

### 第 3 步：修改配置
找到目标配置项并修改

```javascript
// 例子：改变首页显示最新 5 篇文章而不是 3 篇
pages: {
    home: {
        latestArticlesCount: 5,  // ← 修改这里
    }
}
```

### 第 4 步：重新构建网站
```bash
npm run build
# 或
node scripts/builder.js
```

### 第 5 步：验证效果
构建完成后查看 `public/` 目录中生成的网站

---

## 📚 常见配置场景

### 场景 1：改变 Obsidian 库位置
```javascript
// 从其他地方的 Obsidian 库读取文章
obsidian: {
    repositoryPath: 'D:\\Projects\\MyNotes',  // ← 改这里
    enabled: true,
}
```

### 场景 2：关闭 Obsidian，使用本地文件
```javascript
// 改用 src/data/articles/ 下的文件
obsidian: {
    enabled: false,  // ← 改这里
}
```

### 场景 3：改变首页布局
```javascript
pages: {
    home: {
        latestArticlesCount: 5,      // 显示 5 篇文章
        featuredProjectsCount: 3,    // 显示 3 个项目
    }
}
```

### 场景 4：改变日期显示格式
```javascript
dates: {
    displayFormat: 'MMM DD, YYYY',  // 从 "2026年5月3日" 改为 "May 03, 2026"
}
```

### 场景 5：调整文章阅读时间计算
```javascript
articles: {
    frontMatter: {
        wordsPerMinute: 150,  // 从 200 改为 150 (显示更长的阅读时间)
    }
}
```

---

## 🔍 配置查询

### 快速查找表

**按功能分类：**

```
首页相关        → pages.home.*
标签页相关      → pages.tags.*
RSS 相关        → pages.rss.*
文章处理        → articles.*
日期处理        → dates.*
Obsidian 集成   → obsidian.*
路径配置        → paths.*
目录配置        → directories.*
```

**按修改频率分类：**

| 频率 | 配置项 | 位置 |
|-----|--------|------|
| 常改 | 首页文章数、标签排序、日期格式 | pages, dates |
| 偶改 | Obsidian 库位置、忽略文件夹 | obsidian |
| 少改 | 目录位置、路径配置 | directories, paths |
| 极少 | 缓存、调试、优化选项 | cache, debug, optimization |

---

## 🛠️ 调试技巧

### 1. 启用详细日志
```javascript
debug: {
    verbose: true,
    logPathTransforms: true,
    logGeneratedFiles: true,
}
```

### 2. 保留临时文件便于检查
```javascript
debug: {
    keepTempFiles: true,  // 构建完成后 .temp_public 不会被删除
}
```

### 3. 关闭缓存确保看到最新变化
```javascript
cache: {
    enableTemplateCache: false,
}
```

---

## 📖 详细文档导航

| 文档 | 用途 | 何时阅读 |
|-----|------|---------|
| **BUILDER_CONFIG_GUIDE.md** | 详细说明和常见场景 | 🔍 需要理解某个配置 |
| **BUILDER_CONFIG_MAPPING.md** | 配置与代码的关系 | 🔗 想知道配置如何影响代码 |
| **scripts/builder.config.js** | 配置文件本体 | ✏️ 要修改某个配置 |

---

## ⚠️ 重要提示

### 不要修改这些！

```javascript
// ❌ 不要改这个 - 会破坏 GitHub Pages 部署
directories: {
    finalOutput: path.join(PROJECT_ROOT, 'wrong-dir'),
}

// ❌ 不要乱改日期格式 - 所有已有的文章名都要匹配
articles: {
    datePattern: 'wrong-format',
}
```

### 修改前最好备份

```bash
# 备份当前配置
cp scripts/builder.config.js scripts/builder.config.backup.js

# 修改后测试
npm run build

# 如果出错，恢复备份
cp scripts/builder.config.backup.js scripts/builder.config.js
```

---

## 🔄 下一步：集成到 builder.js

builder.js 现在已经读取这个配置文件，并使用其中的目录、页面参数和数据文件路径来构建网站。你后续要做的，主要是继续往 `builder.config.js` 里添加配置项，而不是在 builder.js 里硬编码。

```javascript
// 继续扩展配置时，优先增加 builder.config.js
// 如果新增了 src/data/ 下的 JSON 文件，放到 dataFiles 中统一管理
```

这样就可以完全从配置文件驱动构建流程，而不需要修改 builder.js 的核心代码。

### `dataFiles` 的作用

`dataFiles` 用来统一管理 `src/data/` 下的 JSON 文件和文章目录：

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

如果你以后把某个 JSON 文件改名了，只需要改这里，不需要在 builder.js 里逐个改路径。

---

## ❓ 常见问题

**Q: 修改了配置但没有生效？**
A: 需要重新运行 `npm run build` 或 `node scripts/builder.js`

**Q: 能在运行时传入配置吗？**
A: 目前不支持，但可以修改 builder.js 的构造函数来支持

**Q: 配置文件可以分成多个吗？**
A: 可以的，需要在 builder.config.js 中导入其他配置文件并合并

**Q: 如何为不同环境使用不同配置？**
A: 可以根据 `process.env.NODE_ENV` 来加载不同的配置

```javascript
// 在 builder.config.js 底部
if (process.env.NODE_ENV === 'development') {
    module.exports.debug.verbose = true;
}
```

---

## 📞 需要帮助？

1. 查看 `BUILDER_CONFIG_GUIDE.md` 中的"故障排查"章节
2. 查看 `BUILDER_CONFIG_MAPPING.md` 找到对应的代码位置
3. 在 `scripts/builder.config.js` 中查看配置项旁的注释

