# Blog Publisher - Obsidian 插件

自动将你的 Obsidian 笔记构建并发布到个人博客。

## 🚀 快速安装

### 方法 1：手动安装（推荐）

1. **关闭 Obsidian**（完全退出）

2. **复制插件文件夹**
   
   **Windows**:
   ```bash
   # 复制到 Obsidian 社区插件目录
   xcopy /E /I "C:\Users\29548\Desktop\Sunshine\Mycode\github\MingShuo-S.github.io\blog-pusher" "%APPDATA%\Obsidian\plugins\blog-publisher"
   ```
   
   **或者复制到 Vault 本地插件目录**:
   ```bash
   xcopy /E /I "C:\Users\29548\Desktop\Sunshine\Mycode\github\MingShuo-S.github.io\blog-pusher" "[你的 Vault 路径]\.obsidian\plugins\blog-publisher"
   ```

3. **启动 Obsidian**

4. **启用插件**
   - 打开 设置 → 第三方插件
   - 关闭"安全模式"（如果已开启）
   - 在"已安装的插件"中找到 **Blog Publisher**
   - 点击开关启用

5. **配置插件**
   - 点击左侧边栏的 📝 图标
   - 或在命令面板（Ctrl/Cmd+P）中搜索 "Blog Publisher"
   - 在设置中配置博客仓库路径

### 方法 2：开发模式（适合调试）

1. 在 Obsidian 中：设置 → 第三方插件 → 浏览
2. 点击右上角 "⋮" → "开发模式"
3. 添加插件文件夹路径：`C:\Users\29548\Desktop\Sunshine\Mycode\github\MingShuo-S.github.io\blog-pusher`
4. 启用热重载（可选）

## 📋 功能特性

- ✅ **自动化构建**：一键运行构建脚本，生成静态博客
- ✅ **Git 集成**：自动提交并推送到 GitHub/Gitee
- ✅ **实时日志**：在 Obsidian 内查看构建输出
- ✅ **灵活配置**：支持自定义构建命令和路径
- ✅ **命令面板**：快捷键快速触发

## 🎯 使用方式

### 1. 打开发布控制台

- **方式 1**：点击左侧边栏的 📝 图标
- **方式 2**：命令面板（Ctrl/Cmd+P）→ 搜索 "Blog Publisher: 打开发布控制台"

### 2. 选择操作

- **🔨 构建并提交**：运行构建脚本并提交到 Git
- **🚀 构建并提交推送**：构建、提交并推送到远程仓库

### 3. 查看日志

控制台会实时显示构建进度和结果。

## ⚙️ 配置说明

在插件设置中需要配置：

1. **博客仓库路径**：博客项目的根目录（包含 `package.json` 和 `scripts/builder.js`）
   - 示例：`C:\Users\YourName\Desktop\MyBlog`

2. **ANOTES 文件夹路径**（可选）：Obsidian 笔记保存的文件夹
   - 示例：`C:\Users\YourName\Documents\ANOTES`

3. **构建命令**（可选）：自定义构建命令
   - 默认：`npm run build`

## 🔧 开发

如果你修改了插件源代码，需要重新构建：

```bash
cd blog-pusher
npm install      # 首次安装依赖
npm run build    # 构建插件
```

构建成功后会生成 `main.js` 文件。

## 📁 项目结构

```
blog-pusher/
├── main.ts              # 插件主逻辑（TypeScript 源文件）
├── main.js              # 编译后的插件（Obsidian 加载此文件）
├── settings.ts          # 设置面板
├── manifest.json        # 插件清单
├── package.json         # NPM 配置
├── tsconfig.json        # TypeScript 配置
└── esbuild.config.mjs   # 构建配置
```

## 🐛 故障排除

### 插件不显示

1. 确保已关闭 Obsidian 的"安全模式"
2. 检查 `manifest.json`、`main.js`、`package.json` 是否存在
3. 重启 Obsidian
4. 清除缓存：删除 `.obsidian/plugins/blog-publisher/.gitignore`（如果存在）

### 构建失败

1. 检查博客仓库路径是否正确
2. 确保博客项目已初始化 Git
3. 确保已安装 Node.js 和 npm
4. 查看控制台日志获取详细错误信息

### 推送失败

1. 确保 Git 已正确配置用户名和邮箱
2. 确保远程仓库已关联
3. 检查网络连接

## 📄 许可证

MIT License

## 👨‍💻 作者

Sunshine - [@MingShuo-S](https://github.com/MingShuo-S)

---

**Happy Writing! 📝✨**
