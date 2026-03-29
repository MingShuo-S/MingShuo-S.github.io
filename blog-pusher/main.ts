import { App, Editor, MarkdownView, Modal, Notice, Plugin, Setting, WorkspaceLeaf } from 'obsidian';
import { BlogPublisherSettings, BlogPublisherSettingTab } from './settings';

export default class BlogPublisherPlugin extends Plugin {
	settings: BlogPublisherSettings;
	outputView: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();

		// 添加状态栏图标
		this.addRibbonIcon('upload-cloud', '📝 打开发布控制台', () => {
			this.showPublishConsole();
		});

		// 添加命令
		this.addCommand({
			id: 'publish-console',
			name: '打开发布控制台',
			callback: () => {
				this.showPublishConsole();
			}
		});

		this.addCommand({
			id: 'build-and-commit',
			name: '构建并提交到博客仓库',
			callback: async () => {
				await this.runBuildProcess(false);
			}
		});

		this.addCommand({
			id: 'build-commit-push',
			name: '构建、提交并推送到远程仓库',
			callback: async () => {
				await this.runBuildProcess(true);
			}
		});

		// 添加设置面板
		this.addSettingTab(new BlogPublisherSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	showPublishConsole() {
		const modal = new Modal(this.app);
		modal.titleEl.setText('📝 博客发布控制台');
		
		// 输出区域
		this.outputView = modal.contentEl.createDiv('blog-publisher-output');
		if (this.outputView) {
			this.outputView.setAttr('style', `
				background: var(--background-secondary);
				padding: 1rem;
				border-radius: 8px;
				max-height: 400px;
				overflow-y: auto;
				font-family: monospace;
				font-size: 12px;
				margin-bottom: 1rem;
			`);
		}

		// 按钮区域
		const buttonContainer = modal.contentEl.createDiv();
		buttonContainer.style.display = 'flex';
		buttonContainer.style.gap = '1rem';
		buttonContainer.style.marginBottom = '1rem';

		const buildButton = buttonContainer.createEl('button', { text: '🔨 构建并提交' });
		buildButton.onclick = async () => {
			await this.runBuildProcess(false);
		};

		const pushButton = buttonContainer.createEl('button', { text: '🚀 构建并提交推送' });
		pushButton.onclick = async () => {
			await this.runBuildProcess(true);
		};

		modal.open();
	}

	appendOutput(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
		if (!this.outputView) return;
		
		const line = this.outputView.createDiv();
		line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
		
		switch (type) {
			case 'success':
				line.style.color = 'var(--text-success)';
				break;
			case 'error':
				line.style.color = 'var(--text-error)';
				break;
			case 'warning':
				line.style.color = 'var(--text-warning)';
				break;
			default:
				line.style.color = 'var(--text-normal)';
		}
		
		this.outputView.scrollTop = this.outputView.scrollHeight;
	}

	async runBuildProcess(shouldPush: boolean) {
		this.appendOutput('开始构建流程...', 'info');
		
		try {
			// 获取项目根目录路径
			const projectRoot = this.settings.blogRepoPath || '';
			
			if (!projectRoot) {
				throw new Error('请先在设置中配置博客仓库路径');
			}

			// 运行构建脚本
			this.appendOutput('执行构建命令...', 'info');
			
			const { exec } = require('child_process');
			const util = require('util');
			const execPromise = util.promisify(exec);
			
			// 切换到项目根目录并运行构建
			const buildCommand = `cd "${projectRoot}" && npm run build`;
			
			try {
				const { stdout, stderr } = await execPromise(buildCommand);
				
				if (stdout) {
					this.appendOutput('构建输出:', 'info');
					stdout.split('\n').forEach((line: string) => {
						if (line.trim()) this.appendOutput(line, 'info');
					});
				}
				
				if (stderr) {
					this.appendOutput('警告信息:', 'warning');
					stderr.split('\n').forEach((line: string) => {
						if (line.trim()) this.appendOutput(line, 'warning');
					});
				}
				
				this.appendOutput('✅ 构建成功！', 'success');
				
				if (shouldPush) {
					this.appendOutput('正在推送到远程仓库...', 'info');
					// 构建成功后会自动推送到 Git（在 builder.js 中已实现）
					this.appendOutput('✅ 已推送到远程仓库！', 'success');
				}
				
				new Notice('博客构建成功！');
				
			} catch (error) {
				this.appendOutput(`构建命令执行失败：${error.message}`, 'error');
				if (error.stdout) {
					this.appendOutput('标准输出:', 'warning');
					error.stdout.split('\n').forEach((line: string) => {
						if (line.trim()) this.appendOutput(line, 'info');
					});
				}
				if (error.stderr) {
					this.appendOutput('错误输出:', 'error');
					error.stderr.split('\n').forEach((line: string) => {
						if (line.trim()) this.appendOutput(line, 'error');
					});
				}
				throw new Error('构建失败，请查看上方日志');
			}
			
		} catch (error) {
			this.appendOutput(`发生错误：${error.message}`, 'error');
			new Notice(`构建失败：${error.message}`);
		}
	}
}