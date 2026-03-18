# 项目介绍模块

## 概述

已成功为博客添加"项目介绍"相关模块，包括：

1. **项目展示页面** (`/projects/`) - 完整的项目列表和筛选功能
2. **主页项目展示区** - 精选项目卡片展示
3. **项目数据管理** - 基于 JSON 的项目信息管理
4. **自动构建集成** - 构建脚本自动生成项目页面

## 文件结构

```
src/
├── data/
│   ├── config.json          # 网站配置（已添加 projects 配置）
│   └── projects.json        # 项目数据文件（新增）
├── templates/
│   └── projects.html        # 项目展示页面模板（新增）
└── assets/
    ├── css/
    │   └── style.css        # 样式文件（已更新项目卡片样式）
    └── js/
        └── main.js          # 主逻辑文件
```

## 功能特性

### 1. 项目展示页面

- 📊 **统计数据展示**：项目总数、累计 Stars、使用语言数等
- 🏷️ **分类筛选**：支持按类别筛选项目（全部、开源项目、实验作品、学习笔记）
- ⭐ **精选标记**：支持 featured 标记的精选项目高亮显示
- 🎨 **状态标识**：项目中/开发中/实验中状态可视化
- 🔗 **快捷链接**：一键访问项目主页和 GitHub 仓库

### 2. 数据结构

项目数据采用 JSON 格式，每个项目包含：

```json
{
  "id": 1,
  "title": "项目名称",
  "description": "项目描述",
  "icon": "🚀",
  "category": "open-source",
  "tags": ["标签 1", "标签 2"],
  "url": "https://...",
  "github": "username/repo",
  "status": "active",
  "featured": true,
  "stars": 0,
  "language": "JavaScript"
}
```

### 3. 状态类型

- `active`: 🟢 进行中
- `developing`: 🔵 开发中
- `experimental`: 🟡 实验中
- `completed`: ✅ 已完成
- `archived`: 📦 已归档

## 使用方法

### 添加新项目

1. 编辑 `src/data/projects.json`
2. 在 `projects` 数组中添加新项目对象
3. 运行构建脚本：`node scripts/builder.js`

### 修改项目分类

编辑 `src/data/projects.json` 中的 `categories` 数组：

```json
"categories": [
  {
    "name": "分类名称",
    "filter": "分类标识",
    "count": 0
  }
]
```

### 自定义样式

项目页面的样式已内嵌在模板中，如需修改：
- 编辑 `src/templates/projects.html` 中的 `<style>` 部分
- 或在全局样式 `src/assets/css/style.css` 中添加项目相关样式

## 构建流程

项目页面通过 `scripts/builder.js` 自动生成：

1. 读取 `src/data/projects.json` 数据
2. 使用 `src/templates/projects.html` 模板
3. 生成静态 HTML 到 `public/projects/index.html`
4. 自动更新统计数据

## 路径规范

根据项目规范，不同位置的页面使用不同的路径策略：

- **根目录页面**（如 `index.html`）：使用带 `/public` 前缀的绝对路径
- **子目录页面**（如 `projects/`）：使用相对路径（`../`）引用资源

## 示例项目

当前包含两个示例项目：

1. **RemUp** - 笔记语言工具
2. **MingShuo-S.github.io** - 个人博客系统

## 技术实现

- **模板引擎**：自定义变量替换系统
- **数据处理**：基于 JSON 的数据驱动
- **响应式设计**：适配移动端和桌面端
- **交互功能**：JavaScript 实现分类筛选
- **主题兼容**：支持明暗主题切换

## 待扩展功能

- [ ] 项目搜索功能
- [ ] 项目详情页面
- [ ] GitHub API 集成（自动获取 stars 数）
- [ ] 项目时间线展示
- [ ] 技术栈统计图表

## 注意事项

1. 所有动态内容必须通过变量占位符注入
2. 模板中的条件渲染需基于变量存在性判断
3. 路径转换逻辑需遵循现有规范
4. 确保 slug 逻辑能处理混合语言内容
5. 构建生成内容具有最高优先级

## 相关文件

- `scripts/builder.js` - 构建脚本（已添加 `generateProjectsPage` 方法）
- `src/data/config.json` - 网站配置
- `src/data/projects.json` - 项目数据
- `src/templates/projects.html` - 项目页面模板
- `public/projects/index.html` - 生成的项目页面
