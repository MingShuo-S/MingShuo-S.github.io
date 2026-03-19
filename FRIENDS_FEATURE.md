# 友情链接功能说明

## 功能概述

友情链接功能已在主页成功实现，用于展示推荐的博客、网站或社交平台链接。该功能独立于导航栏，仅在主页展示。

---

## 文件结构

### 1. 数据文件
**位置**: `src/data/friends.json`

**数据结构**:
```json
{
    "links": [
        {
            "title": "站点名称",
            "url": "https://example.com",
            "description": "站点描述",
            "icon": "fas fa-link",
            "category": "分类名称"
        }
    ]
}
```

**字段说明**:
- `title` (必填): 友链站点名称
- `url` (必填): 友链地址
- `description` (可选): 站点描述，建议 50 字以内
- `icon` (可选): Font Awesome 图标类名，默认使用 `fas fa-link`
- `category` (可选): 分类标签，如"开发社区"、"视频平台"等

---

### 2. 模板文件
**位置**: `src/templates/index.html`

**HTML 结构**:
```html
<!-- 友情链接 -->
<section class="friends-section" id="friends">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">友情链接</h2>
        </div>
        
        <div class="friends-grid" id="friendsGrid">
            ___FRIENDS_LIST_PLACEHOLDER___
        </div>
    </div>
</section>
```

**位置**: 位于"精选项目"和"数据统计"之间

---

### 3. 样式文件
**位置**: `src/assets/css/projects.css`

**包含的样式类**:
- `.friends-section` - 友链区域容器
- `.friends-grid` - 友链网格布局
- `.friend-card` - 友链卡片
- `.friend-icon` - 友链图标
- `.friend-info` - 友链信息
- `.friend-title` - 友链标题
- `.friend-description` - 友链描述
- `.friend-category` - 友链分类标签
- `.no-friends` - 无友链提示

**设计特点**:
- 响应式网格布局（自动适配移动端）
- 悬停效果（卡片上移 + 阴影加深 + 边框变色）
- 统一的视觉风格（与项目卡片保持一致）
- Font Awesome 图标支持

---

### 4. 构建脚本
**位置**: `scripts/builder.js`

**处理方法**: `generateIndexPage()` 中的友情链接处理逻辑

**处理流程**:
1. 读取 `src/data/friends.json` 文件
2. 解析 links 数组
3. 为每个友链生成 HTML 卡片
4. 替换模板中的 `___FRIENDS_LIST_PLACEHOLDER___` 占位符
5. 输出到主页

**代码片段**:
```javascript
// 生成友情链接 HTML
const friendsFile = path.join(this.dataDir, 'friends.json');
let friendsHtml = '';

if (await fs.pathExists(friendsFile)) {
    const friendsData = await fs.readJson(friendsFile);
    const links = friendsData.links || [];
    
    friendsHtml = links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener" class="friend-card">
            <div class="friend-icon">
                <i class="${link.icon || 'fas fa-link'}"></i>
            </div>
            <div class="friend-info">
                <h3 class="friend-title">${link.title}</h3>
                <p class="friend-description">${link.description || ''}</p>
                ${link.category ? `<span class="friend-category">${link.category}</span>` : ''}
            </div>
        </a>
    `).join('\n');
} else {
    friendsHtml = '<p class="no-friends">暂无友情链接。</p>';
}

// 替换友情链接占位符
html = html.replace('___FRIENDS_LIST_PLACEHOLDER___', friendsHtml);
```

---

## 使用方法

### 添加新友链

编辑 `src/data/friends.json` 文件：

```json
{
    "links": [
        {
            "title": "GitHub",
            "url": "https://github.com/MingShuo-S",
            "description": "我的 GitHub 主页，记录开源项目和代码实践",
            "icon": "fab fa-github",
            "category": "开发社区"
        },
        {
            "title": "Bilibili",
            "url": "https://space.bilibili.com/361518274",
            "description": "B 站个人空间，分享技术视频和学习内容",
            "icon": "fab fa-bilibili",
            "category": "视频平台"
        },
        {
            "title": "新友链",
            "url": "https://example.com",
            "description": "这是一个新的友链",
            "icon": "fas fa-star",
            "category": "个人博客"
        }
    ]
}
```

然后运行构建命令：
```bash
node scripts/builder.js
```

---

## 图标选择

友情链接支持 Font Awesome 图标库，常用图标类名：

### 社交平台
- `fab fa-github` - GitHub
- `fab fa-bilibili` - Bilibili
- `fab fa-weixin` - 微信
- `fab fa-qq` - QQ
- `fab fa-weibo` - 微博
- `fab fa-zhihu` - 知乎
- `fab fa-twitter` - Twitter
- `fab fa-facebook` - Facebook
- `fab fa-instagram` - Instagram
- `fab fa-linkedin` - LinkedIn

### 通用图标
- `fas fa-link` - 链接（默认）
- `fas fa-blog` - 博客
- `fas fa-globe` - 网站
- `fas fa-user` - 个人
- `fas fa-heart` - 喜爱
- `fas fa-star` - 推荐
- `fas fa-book` - 书籍
- `fas fa-code` - 代码

完整图标库参考：[Font Awesome Icons](https://fontawesome.com/icons)

---

## 样式定制

### 修改卡片数量（每行）

编辑 `projects.css` 中的 `.friends-grid`:

```css
.friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 修改 280px 调整卡片宽度 */
    gap: 1.5rem; /* 修改间距 */
    margin-top: 2rem;
}
```

### 修改悬停效果

编辑 `.friend-card:hover`:

```css
.friend-card:hover {
    transform: translateY(-4px); /* 修改上移距离 */
    box-shadow: 0 8px 20px rgba(74, 108, 247, 0.2); /* 修改阴影 */
    border-color: var(--primary-color); /* 修改边框颜色 */
}
```

### 修改响应式断点

编辑 `@media (max-width: 768px)`:

```css
@media (max-width: 768px) {
    .friends-grid {
        grid-template-columns: 1fr; /* 移动端单列显示 */
    }
}
```

---

## 特性说明

### 1. 自动打开新标签
所有友链都会自动添加 `target="_blank"` 和 `rel="noopener"` 属性，确保在新标签页中打开并提升安全性。

### 2. 空状态处理
如果 `friends.json` 文件不存在或 links 数组为空，会显示"暂无友情链接。"提示。

### 3. 响应式设计
- **桌面端**: 自适应网格布局，根据屏幕宽度自动调整每行卡片数量
- **移动端**: 单列垂直布局，便于浏览

### 4. 无障碍访问
- 使用语义化的 `<a>` 标签
- 支持键盘导航
- 颜色对比度符合 WCAG 标准

---

## 扩展示例

### 示例 1: 添加更多社交平台

```json
{
    "links": [
        {
            "title": "GitHub",
            "url": "https://github.com/MingShuo-S",
            "description": "开源项目和代码实践",
            "icon": "fab fa-github",
            "category": "开发社区"
        },
        {
            "title": "知乎",
            "url": "https://www.zhihu.com/people/xxx",
            "description": "技术问答和知识分享",
            "icon": "fab fa-zhihu",
            "category": "社交问答"
        },
        {
            "title": "掘金",
            "url": "https://juejin.cn/user/xxx",
            "description": "技术文章和动态",
            "icon": "fas fa-pen-fancy",
            "category": "技术社区"
        }
    ]
}
```

### 示例 2: 添加朋友博客

```json
{
    "links": [
        {
            "title": "张三的博客",
            "url": "https://zhangsan.com",
            "description": "前端开发笔记和生活记录",
            "icon": "fas fa-blog",
            "category": "个人博客"
        },
        {
            "title": "李四的技术栈",
            "url": "https://lisi.tech",
            "description": "后端架构和系统设计分享",
            "icon": "fas fa-server",
            "category": "技术博客"
        }
    ]
}
```

### 示例 3: 添加资源网站

```json
{
    "links": [
        {
            "title": "MDN Web Docs",
            "url": "https://developer.mozilla.org",
            "description": "Web 开发者必备文档",
            "icon": "fab fa-firefox-browser",
            "category": "学习资源"
        },
        {
            "title": "Stack Overflow",
            "url": "https://stackoverflow.com",
            "description": "程序员问答社区",
            "icon": "fab fa-stack-overflow",
            "category": "技术社区"
        }
    ]
}
```

---

## 注意事项

### 1. 数据安全
- 只添加可信任的友链
- 定期检查友链有效性
- 避免添加恶意或违规网站

### 2. 性能优化
- 建议友链数量控制在 20 个以内
- 描述文字简洁明了（50 字以内）
- 避免使用过大的自定义图标

### 3. SEO 友好
- 使用 `rel="noopener"` 提升安全性
- 可考虑添加 `rel="nofollow"` 避免权重传递
- 保持友链描述的独特性和相关性

### 4. 移动端体验
- 测试移动端的显示效果
- 确保触摸区域足够大（至少 44x44px）
- 避免过多的友链影响加载速度

---

## 故障排除

### 问题 1: 友链不显示

**检查步骤**:
1. 确认 `src/data/friends.json` 文件存在
2. 检查 JSON 格式是否正确
3. 确认 links 数组不为空
4. 重新运行构建脚本

### 问题 2: 图标不显示

**解决方案**:
1. 检查 Font Awesome 是否正确引入
2. 确认图标类名拼写正确（区分 `fas`、`fab`、`far`）
3. 查看浏览器开发者工具的网络请求

### 问题 3: 样式异常

**解决方案**:
1. 检查 `projects.css` 是否正确引用
2. 清除浏览器缓存
3. 查看 CSS 是否有语法错误

---

## 更新日志

### v1.0.0 (2026-03-19)
- ✅ 初始版本发布
- ✅ 支持基础友链展示
- ✅ 响应式设计
- ✅ 悬停交互效果
- ✅ Font Awesome 图标支持
- ✅ 分类标签功能

---

## 相关文档

- [项目架构说明](./README.md)
- [标签分类功能](./TAGS_UPDATE_2026.md)
- [构建脚本使用](./BUILD_GUIDE.md)

---

**更新时间**: 2026-03-19  
**作者**: MingShuo-S  
**版本**: v1.0.0
