import { App, PluginSettingTab, Setting } from 'obsidian';
import BlogPublisherPlugin from './main';

export interface BlogPublisherSettings {
	blogRepoPath: string;
	anotesPath: string;
	buildCommand: string;
}

export class BlogPublisherSettingTab extends PluginSettingTab {
	plugin: BlogPublisherPlugin;

	constructor(app: App, plugin: BlogPublisherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('博客仓库路径')
			.setDesc('博客项目的根目录路径（包含 package.json 和 scripts/builder.js）')
			.addText(text => text
				.setPlaceholder('例如：C:\\Users\\YourName\\Desktop\\MyBlog')
				.setValue(this.plugin.settings.blogRepoPath || '')
				.onChange(async (value) => {
					this.plugin.settings.blogRepoPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('ANOTES 文件夹路径')
			.setDesc('Obsidian 笔记保存的文件夹路径（可选，用于自动同步）')
			.addText(text => text
				.setPlaceholder('例如：C:\\Users\\YourName\\Documents\\ANOTES')
				.setValue(this.plugin.settings.anotesPath || '')
				.onChange(async (value) => {
					this.plugin.settings.anotesPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('构建命令')
			.setDesc('自定义构建命令（留空则使用默认的 npm run build）')
			.addText(text => text
				.setPlaceholder('npm run build')
				.setValue(this.plugin.settings.buildCommand || '')
				.onChange(async (value) => {
					this.plugin.settings.buildCommand = value;
					await this.plugin.saveSettings();
				}));

		// 使用说明
		containerEl.createEl('hr');
		containerEl.createEl('h3', { text: '使用说明' });
		
		const instructions = [
			'1. 确保已正确配置博客仓库路径和 ANOTES 路径',
			'2. 确保博客仓库已初始化 Git 并关联远程仓库',
			'3. 在 Obsidian 中撰写笔记并保存到 ANOTES 文件夹',
			'4. 点击左侧工具栏的 📝 图标打开发布控制台',
			'5. 选择"构建并提交"或"构建并提交推送"',
			'6. 查看输出日志确认是否成功',
			'',
			'**提示**: 也可以使用命令面板（Ctrl/Cmd+P），搜索"Blog Publisher"执行相应命令'
		];

		instructions.forEach(instruction => {
			containerEl.createEl('p', { 
				text: instruction,
				cls: instruction.startsWith('**') ? 'blog-publisher-bold' : undefined
			});
		});
	}
}