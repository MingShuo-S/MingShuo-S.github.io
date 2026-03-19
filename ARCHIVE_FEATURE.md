# 时间线归档功能说明

## 功能概述

时间线归档功能提供了一种全新的文章浏览方式，按照年份和月份组织所有文章，让访客可以沿着时间轴回顾你的创作历程。该功能未添加到导航栏，而是通过文章列表页的快捷按钮访问，符合用户的自然浏览路径。

---

## 实现内容

### 1. **时间线归档页面**

**文件位置**: `public/archive/index.html`

**核心特性**:
- ✅ 按年份分组（倒序排列）
- ✅ 每年显示文章总数
- ✅ 按月份网格化展示
- ✅ 时间线索引标记（日期圆圈）
- ✅ 悬停交互效果
- ✅ 响应式布局

### 2. **文章列表页快捷按钮**

**位置**: 文章列表页右上角

**设计**:
- 🔹 渐变蓝色背景
- 🔹 档案盒图标 + "时间线归档"文字
- 🔹 悬停上浮效果
- 🔹 移动端自适应（自动调整位置）

**用户动线**:
```
访问文章列表 → 看到归档按钮 → 点击进入时间线 → 按时间浏览文章
```

---

## 页面结构

### 时间线索引页面布局

```
┌─────────────────────────────────────┐
│   🗂️ 时间线归档                     │
│   按时间顺序浏览所有文章...         │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 2026 年 [1 篇文章]                  │
│ │                                   │
│ ├─ 三月                             │
│ │   ○18 → 《你好，欢迎》           │
│ │        标签：博客                 │
│ └─────────────────────────          │
│                                     │
│ 2025 年 [1 篇文章]                  │
│ │                                   │
│ ├─ 一月                             │
│ │   ○28 → 《从零搭建静态博客》     │
│ │        标签：前端工程、静态站点…  │
│ └─────────────────────────          │
└─────────────────────────────────────┘
```

---

## 技术实现

### 1. **构建脚本处理逻辑**

#### 数据分组算法
```javascript
// 按年份和月份分组文章
const archiveData = {};
articles.forEach(article => {
    const date = new Date(article.rawDate || article.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (!archiveData[year]) archiveData[year] = {};
    if (!archiveData[year][month]) archiveData[year][month] = [];
    
    archiveData[year][month].push(article);
});
```

#### 排序策略
- **年份**: 倒序排列（新→旧）
- **月份**: 倒序排列（12 月→1 月）
- **文章**: 保持原始顺序（已按日期倒序）

### 2. **HTML 模板结构**

```html
<div class="timeline-year">
    <div class="year-header">
        <h2 class="year-title">2026 年</h2>
        <span class="year-count">1 篇文章</span>
    </div>
    <div class="timeline-line"></div>
    <div class="months-grid">
        <div class="month-group">
            <h3 class="month-title">三月</h3>
            <div class="articles-timeline">
                <div class="timeline-item">
                    <div class="timeline-marker">
                        <span class="day">18</span>
                    </div>
                    <div class="timeline-content">
                        <a href="../posts/hello-u/" class="article-link">
                            <h4>你好，欢迎</h4>
                        </a>
                        <p class="article-excerpt">一篇对个人博客的基础介绍</p>
                        <div class="article-meta">
                            <span class="tag">博客</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 3. **CSS 样式系统**

#### 颜色变量
```css
--primary-color: #4a6cf7      /* 主色调 */
--accent-color: #0d6efd       /* 强调色 */
--bg-card: #ffffff            /* 卡片背景 */
--bg-secondary: #f8f9fa       /* 次要背景 */
--text-primary: #333333       /* 主要文字 */
--text-secondary: #666666     /* 次要文字 */
```

#### 时间线索引标记设计
```css
.timeline-marker {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, 
        var(--primary-color), 
        var(--accent-color)
    );
    box-shadow: 0 4px 8px rgba(74, 108, 247, 0.3);
}
```

#### 悬停效果系统
1. **月份卡片**: 上浮 4px + 阴影加深
2. **时间线索引项**: 背景变色 + 边框高亮
3. **文章标题**: 变为主题蓝色
4. **标签**: 背景填充 + 文字变白

### 4. **JavaScript 交互功能**

#### 核心功能
- ✅ 平滑滚动到指定年份（支持 URL hash）
- ✅ 返回顶部按钮（滚动时自动显示/隐藏）
- ✅ 进入动画（滚动加载时淡入）
- ✅ 点击反馈（缩放、透明度变化）

#### 动画系统
```javascript
// 进入动画 - 交错延迟效果
timelineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = `all 0.5s ease ${index * 0.05}s`;
    observer.observe(item);
});
```

---

## 视觉设计亮点

### 1. **时间线索引系统**
- 🎯 **日期圆圈**: 渐变色圆形标记，突出显示具体日期
- 🎯 **连接线**: 半透明线条连接每个索引项
- 🎯 **内容卡片**: 圆角矩形卡片，包含标题、摘要、标签

### 2. **网格布局**
- 📐 **桌面端**: 自适应网格，每行显示多个月份卡片
- 📐 **移动端**: 单列垂直布局，便于滑动浏览
- 📐 **断点**: 768px

### 3. **色彩层次**
- 🎨 **主色**: 蓝色渐变（#4a6cf7 → #0d6efd）
- 🎨 **背景**: 纯色 + 渐变组合
- 🎨 **阴影**: 三层结构（基础 + 悬停 + 光晕）

### 4. **动效设计**
- ⚡ **过渡时间**: 0.3s - 0.5s
- ⚡ **缓动函数**: cubic-bezier 专业曲线
- ⚡ **性能优化**: 基于 transform，避免重排

---

## 使用体验

### 从文章列表到归档

1. **访问文章列表页** (`/writings/`)
2. **看到右上角的"时间线归档"按钮**
   - 蓝色渐变背景
   - 档案盒图标
   - 悬停上浮效果
3. **点击按钮**
4. **跳转到归档页面** (`/archive/`)
5. **沿时间轴浏览文章**

### 在归档页面内浏览

1. **查看年份分组**（倒序排列）
2. **浏览月份卡片**（网格布局）
3. **点击文章标题或卡片**
4. **跳转到文章详情页**

### 高级功能

#### URL Hash 跳转
```
https://mingshuo-s.github.io/public/archive/#year-2025
```
直接跳转到 2025 年的区块

#### 键盘导航
- ↑↓ 方向键：滚动页面
- Home/End：顶部/底部

---

## 响应式设计

### 桌面端 (>768px)
- ✅ 多列网格布局
- ✅ 归档按钮固定在右上角
- ✅ 完整的悬停效果
- ✅ 时间线索引标记带连接线

### 移动端 (≤768px)
- ✅ 单列垂直布局
- ✅ 归档按钮调整为独立一行
- ✅ 简化动画效果
- ✅ 日期圆圈缩小（50px → 40px）
- ✅ 移除连接线（节省空间）

---

## 数据统计

当前归档页面包含：
- **年份数量**: 2 个（2026 年、2025 年）
- **文章总数**: 2 篇
- **月份分组**: 2 个（三月、一月）
- **平均每年**: 1 篇文章

---

## 扩展建议

### 未来可添加的功能

1. **年份筛选器**
   - 快速跳转到特定年份
   - 下拉菜单选择

2. **搜索功能**
   - 结合文章标题和摘要
   - 实时过滤结果

3. **统计图表**
   - 每月文章数量柱状图
   - 年度创作趋势折线图

4. **RSS 订阅细分**
   - 按年份订阅
   - 按月份订阅

5. **导出功能**
   - 导出某年的所有文章为 PDF
   - 生成年度精选集

---

## 最佳实践

### 1. 文章日期管理
确保每篇文章的 Front Matter 中包含准确的日期：
```markdown
---
title: "文章标题"
date: 2026-03-19  # 必须格式：YYYY-MM-DD
---
```

### 2. 文章数量建议
- **少于 10 篇**: 时间线和列表页差异不大
- **10-50 篇**: 时间线优势开始显现
- **超过 50 篇**: 时间线成为必备功能

### 3. 性能优化
- 使用 Intersection Observer 实现懒加载
- 避免过多的 DOM 操作
- CSS 动画优先于 JavaScript 动画

---

## 故障排除

### Q1: 归档页面显示空白？
**A**: 检查以下几点：
1. 确认 `public/archive/index.html` 文件存在
2. 检查构建脚本是否成功执行
3. 查看浏览器控制台是否有错误

### Q2: 归档按钮点击无反应？
**A**: 检查路径是否正确：
- 文章列表页的路径应为 `/writings/`
- 归档页面路径应为 `../archive/`

### Q3: 时间线排序不正确？
**A**: 确保文章文件名包含正确的日期前缀：
```
✅ 正确：2026-03-19-article-title.md
❌ 错误：article-title-2026-03-19.md
```

---

## 相关文件

### 源码位置
- **构建逻辑**: `scripts/builder.js` - `generateArchivePage()` 方法
- **样式文件**: `src/assets/css/archive.css`
- **交互脚本**: `src/assets/js/archive.js`
- **生成页面**: `public/archive/index.html`
- **文章列表页**: `public/writings/index.html`

### 修改建议
如需调整样式，优先修改以下 CSS 变量：
```css
:root {
    --primary-color: #4a6cf7;      /* 主色调 */
    --accent-color: #0d6efd;       /* 强调色 */
    --transition: all 0.3s ease;   /* 过渡效果 */
}
```

---

## 更新日志

### v1.0.0 (2026-03-19)
- ✅ 初始版本发布
- ✅ 时间线索引页面
- ✅ 按年月分组展示
- ✅ 文章列表页快捷按钮
- ✅ 响应式设计
- ✅ 交互动画系统
- ✅ RSS 自动发现链接
- ✅ 返回顶部功能
- ✅ 滚动加载动画

---

## 相关资源

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)
- [平滑滚动最佳实践](https://web.dev/smooth-scrolling/)

---

**创建时间**: 2026-03-19  
**作者**: MingShuo-S  
**版本**: v1.0.0  
**许可**: MIT License
