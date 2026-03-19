# RSS 订阅功能说明

## 功能概述

RSS（Really Simple Syndication）是一种用于发布经常更新内容的格式，如博客文章、新闻标题和摘要。用户可以通过 RSS 阅读器订阅你的博客，无需访问网站即可获取最新文章更新。

---

## 实现内容

### 1. RSS 订阅源生成

**文件位置**: `public/rss.xml`

**生成方式**: 构建脚本自动生成，每次运行 `node scripts/builder.js` 时都会更新

**包含内容**:
- 最新的 20 篇文章
- 每篇文章的标题、链接、发布日期、摘要、标签
- 符合 RSS 2.0 标准规范

---

## RSS 文件结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sunshine's Blog</title>
    <link>https://mingshuo-s.github.io</link>
    <description>记录技术思考、项目经验和学习成长</description>
    <language>zh-cn</language>
    <lastBuildDate>Thu, 19 Mar 2026 14:35:25 GMT</lastBuildDate>
    <pubDate>Thu, 19 Mar 2026 14:35:25 GMT</pubDate>
    <ttl>60</ttl>
    
    <!-- 文章条目 -->
    <item>
      <title>你好，欢迎</title>
      <link>https://mingshuo-s.github.io/public/posts/hello-u/</link>
      <guid isPermaLink="true">https://mingshuo-s.github.io/public/posts/hello-u/</guid>
      <pubDate>Wed, 18 Mar 2026 00:00:00 GMT</pubDate>
      <description>一篇对个人博客的基础介绍</description>
      <author>Mingshuo_S</author>
      <category>博客</category>
    </item>
  </channel>
</rss>
```

---

## RSS 自动发现

已在所有页面的 `<head>` 区域添加了 RSS 自动发现链接，浏览器可以自动识别并提供订阅选项：

```html
<link rel="alternate" type="application/rss+xml" title="Sunshine's Blog" href="https://mingshuo-s.github.io/rss.xml">
```

**已覆盖的页面**:
- ✅ 主页 (`index.html`)
- ✅ 文章详情页 (`posts/*/index.html`)
- ✅ 文章列表页 (`writings/index.html`)
- ✅ 标签分类页 (`tags/index.html`)
- ✅ 项目展示页 (`projects/index.html`)
- ✅ 关于页面 (`about/index.html`)

---

## 使用方法

### 对于博主（你）

#### 1. 添加新文章
只需正常发布文章，RSS 会自动包含最新内容：

```bash
# 创建新文章
echo "---
title: '新文章'
date: 2026-03-19
summary: 文章摘要
---
正文内容..." > src/data/articles/2026-03-19-new-article.md

# 重新构建
node scripts/builder.js
```

RSS 会自动：
- 包含最新的 20 篇文章
- 更新时间戳
- 保持正确的排序

#### 2. 自定义 RSS 设置

编辑 `src/data/config.json` 修改站点信息：

```json
{
    "site": {
        "title": "Sunshine's Blog",
        "description": "你的博客描述",
        "author": "你的名字",
        "url": "https://yourusername.github.io"
    }
}
```

---

### 对于读者

#### 1. 订阅博客

**方法 A: 通过浏览器地址栏**
1. 访问 https://mingshuo-s.github.io
2. 在地址栏末尾添加 `/rss.xml`
3. 按回车查看 RSS 源

**方法 B: 通过 RSS 阅读器**
1. 复制 RSS 地址：`https://mingshuo-s.github.io/rss.xml`
2. 在 RSS 阅读器中添加订阅

**方法 C: 浏览器自动发现**
1. 访问博客任意页面
2. 浏览器检测到 RSS 后会显示订阅图标
3. 点击图标即可订阅

---

## 推荐的 RSS 阅读器

### 在线服务
- **Feedly** (feedly.com) - 最流行的在线 RSS 阅读器
- **Inoreader** (inoreader.com) - 功能强大的 RSS 管理工具
- **The Old Reader** (theoldreader.com) - 简洁怀旧的界面
- **Feedbin** (feedbin.com) - 付费但体验优秀

### 桌面应用
- **NetNewsWire** (macOS/iOS) - 免费开源
- **Reeder** (macOS/iOS) - 设计精美
- **Fluent Reader** (Windows/macOS/Linux) - 现代化跨平台

### 移动端
- **Feedly** (iOS/Android)
- **Inoreader** (iOS/Android)
- **Fiery Feeds** (iOS)
- **FeedMe** (Android)

---

## 技术细节

### RSS 2.0 规范

本博客使用 **RSS 2.0** 标准，并支持以下扩展：

1. **Atom 命名空间**
   - 用于自我引用链接 (`<atom:link>`)
   - 提供更好的订阅体验

2. **Content 命名空间**
   - 用于完整文章内容（未来可扩展）
   - 目前使用 `<description>` 提供摘要

3. **RFC 822 日期格式**
   - 所有日期均转换为标准的 RFC 822 格式
   - 例如：`Thu, 19 Mar 2026 14:35:25 GMT`

### XML 转义处理

为确保 RSS 文件的合法性，所有特殊字符都会自动转义：

| 原始字符 | 转义后 |
|---------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

### 摘要生成策略

RSS 中的文章摘要按以下优先级生成：

1. **优先使用** Front Matter 中的 `summary` 字段
2. **其次使用** 文章摘录（excerpt，如果有）
3. **最后截取** 正文前 200 字（移除 HTML 标签）

**推荐做法**: 为每篇文章编写精炼的摘要（建议 50-200 字）

```markdown
---
title: "文章标题"
date: 2026-03-19
summary: "这是文章的摘要，会显示在 RSS 订阅中，吸引读者点击阅读全文。"
---
```

---

## 验证 RSS 订阅

### 在线验证工具

1. **W3C Feed Validation Service**
   - 网址：https://validator.w3.org/feed/
   - 输入你的 RSS 地址：`https://mingshuo-s.github.io/rss.xml`
   - 检查是否符合标准

2. **XML Validation**
   - 网址：https://www.xmlvalidation.com/
   - 验证 XML 语法正确性

### 本地预览

在浏览器中打开 RSS 文件：
```bash
# Windows
start public/rss.xml

# macOS
open public/rss.xml

# Linux
xdg-open public/rss.xml
```

或使用命令行查看：
```bash
cat public/rss.xml
```

---

## 常见问题

### Q1: RSS 地址是什么？
**A**: `https://mingshuo-s.github.io/rss.xml`

### Q2: 如何限制 RSS 中包含的文章数量？
**A**: 当前设置为最新的 20 篇。如需修改，编辑 `scripts/builder.js` 中的 `generateRSSFeed` 方法：
```javascript
const latestArticles = articles.slice(0, 20); // 改为其他数字
```

### Q3: RSS 中的文章链接不正确怎么办？
**A**: 确保 `config.json` 中的 `site.url` 配置正确：
```json
{
    "site": {
        "url": "https://mingshuo-s.github.io"
    }
}
```

### Q4: 如何让 RSS 包含完整文章而不是摘要？
**A**: 修改 `generateRSSFeed` 方法，使用 `content:encoded` 字段：
```javascript
// 添加完整内容
rssContent += `
<content:encoded><![CDATA[${article.content}]]></content:encoded>
`;
```

### Q5: RSS 更新频率是多少？
**A**: RSS 文件在每次构建时都会更新（`ttl` 设置为 60 分钟），建议每次发布新文章后重新构建。

---

## 最佳实践

### 1. 为每篇文章编写摘要
```markdown
---
title: "深入理解 JavaScript 闭包"
date: 2026-03-19
summary: "本文通过实际案例深入浅出地讲解 JavaScript 闭包的概念、原理和应用场景，帮助开发者彻底理解这一核心特性。"
---
```

### 2. 使用有意义的标签
```markdown
---
tags: ["JavaScript", "前端开发", "闭包", "高级特性"]
---
```

这些标签会出现在 RSS 中，帮助读者快速了解文章主题。

### 3. 定期更新
保持稳定的更新频率，让订阅者能够持续获得有价值的内容。

### 4. 推广 RSS 订阅
- 在网站首页添加 RSS 订阅按钮
- 在社交媒体分享 RSS 地址
- 鼓励读者通过 RSS 订阅而非依赖算法推荐

---

## 扩展示例

### 添加完整的文章内容到 RSS

如果你希望 RSS 包含完整文章（而不仅仅是摘要），可以修改 `generateRSSFeed` 方法：

```javascript
// 在 item 中添加完整内容
rssContent += `
<content:encoded><![CDATA[
    ${article.content || ''}
]]></content:encoded>
`;
```

**注意**: 这会增加 RSS 文件大小，可能影响加载速度。

### 添加文章封面图

```javascript
if (article.coverImage) {
    rssContent += `
<enclosure url="${article.coverImage}" type="image/jpeg"/>
    `;
}
```

### 添加作者头像

```javascript
// 在 channel 中添加作者信息
rssContent += `
<image>
    <url>https://mingshuo-s.github.io/public/assets/images/avatar.jpg</url>
    <title>Sunshine's Blog</title>
    <link>https://mingshuo-s.github.io</link>
</image>
`;
```

---

## 统计数据

当前 RSS 订阅源包含：
- **总文章数**: 2 篇
- **最大容量**: 20 篇
- **平均长度**: 约 100 字/篇摘要
- **更新日期**: 每次构建时自动更新

---

## 相关资源

- [RSS 2.0 规范文档](http://www.rssboard.org/rss-specification)
- [Atom 规范](https://tools.ietf.org/html/rfc4287)
- [RSS 最佳实践](https://www.rssboard.org/rss-profile)
- [如何推广 RSS 订阅](https://www.makeuseof.com/tag/promote-rss-feed-subscribers/)

---

## 更新日志

### v1.0.0 (2026-03-19)
- ✅ 初始版本发布
- ✅ 自动生成 RSS 2.0 订阅源
- ✅ 包含最新 20 篇文章
- ✅ 支持文章摘要和标签
- ✅ 所有页面添加 RSS 自动发现链接
- ✅ XML 特殊字符自动转义
- ✅ RFC 822 日期格式标准化

---

**创建时间**: 2026-03-19  
**作者**: MingShuo-S  
**版本**: v1.0.0  
**许可**: MIT License
