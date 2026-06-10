import {CachedMetadata, MarkdownView, Plugin, TAbstractFile, TFile} from 'obsidian';
import CoverMarkdownPostProcessor from './CoverMarkdownPostProcessor'

export const IMAGES = new Map<string, string>();
export const CONTAINERS = new Map<HTMLElement, string>();

export default class ObsidianCoverImage extends Plugin {
	async onload(): Promise<void> {
		this.registerMarkdownPostProcessor(new CoverMarkdownPostProcessor().instance());

		this.registerEvent(
			this.app.workspace.on('file-open', async (file) => {
				this.onFileOpen(file);
			})
		);

		this.registerEvent(
			this.app.vault.on('rename', async (file: TAbstractFile, oldPath: string) => {
				this.onRename(file, oldPath);
			})
		);

		this.registerEvent(
			this.app.workspace.on('layout-change', async () => {
				this.onLayoutChange();
			})
		);

		this.registerEvent(
			this.app.metadataCache.on('changed', async (file, data, cache) => {
				this.onChanged(file, data, cache);
			})
		);
	}

	onunload() {
		IMAGES.clear();
		for (const container of CONTAINERS.keys()) {
			container.remove();
		}
		CONTAINERS.clear();
	}

	private onRename(file: TAbstractFile, oldPath: string) {
		if (file instanceof TFile && file.extension === 'md') {
			const cover = IMAGES.get(oldPath);
			if (cover) {
				IMAGES.delete(oldPath);
				IMAGES.set(file.path, cover);
			}
		}
	}

	private onLayoutChange() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const file = view.file;
			if (file) {
				if (file.extension !== 'md') {
					return;
				}
				const container = view.contentEl.find('.cover-container');
				if (container) {
					const cover = IMAGES.get(file.path);
					if (cover) {
						let img = container.find('img');
						if (!img) {
							img = container.createEl('img');
							img.setAttribute('src', cover);
							container.append(img);
						} else {
							if (cover !== img.getAttribute('src')) {
								img.setAttribute('src', cover);
							}
						}
					} else {
						this.removeCover(file);
					}
				}
				CONTAINERS.set(container, file.path);
			}
		}


		for (const container of CONTAINERS.keys()) {
			if (!activeDocument.body.contains(container)) {
				CONTAINERS.delete(container);
			}
		}
	}

	private onChanged(file: TFile, data: string, cache: CachedMetadata) {
		if (file.extension !== 'md') {
			return;
		}
		const src = this.getSrc(file, cache);
		if (src) {
			const oldSrc = IMAGES.get(file.path);

			if (!oldSrc) {
				IMAGES.set(file.path, src);
			}

			if (src !== oldSrc) {
				for (const [container, f] of CONTAINERS) {
					if (file.path === f) {
						let img = container.find('img');
						if (!img) {
							img = container.createEl('img');
							img.setAttribute('src', src);
							container.append(img);
						} else {
							img.setAttribute('src', src);
						}
					}
				}
			}
		} else {
			this.removeCover(file);
		}
	}

	private removeCover(file: TFile) {
		for (const [container, f] of CONTAINERS) {
			if (file.path === f) {
				const img = container.find('img');
				if (img) {
					img.remove();
				}
			}
		}

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const container = view.contentEl.find('.cover-container');
			if (container) {
				const img = container.find('img');
				if (img) {
					img.remove();
				}
			}
		}

		if (IMAGES.has(file.path)) {
			IMAGES.delete(file.path);
		}
	}

	private onFileOpen(file: TFile | null) {
		if (file) {
			if (file.extension !== 'md') {
				return;
			}
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				const containers = view.contentEl.find('.cover-container');
				if (!containers) {
					const editor = view.contentEl.find('.cm-sizer');
					if (editor) {
						const coverContainer = editor.createDiv();
						coverContainer.classList.add('cover-container');
						CONTAINERS.set(coverContainer, file.path);
						editor.prepend(coverContainer);
					}
				}
			}
			if (!IMAGES.has(file.path)) {
				const metadata = this.app.metadataCache.getFileCache(file);
				if (metadata) {
					const src = this.getSrc(file, metadata);
					if (src) {
						IMAGES.set(file.path, src);
					}
				}
			}
		}
	}

	private getSrc(file: TFile, metadata: CachedMetadata): string | null {
		const frontmatter = metadata.frontmatter;
		if (frontmatter) {
			let cover = frontmatter.cover as string;
			if (cover) {
				if (cover.startsWith('[[')) {
					cover = cover.slice(2, -2);
				}
				const attachment = this.app.metadataCache.getFirstLinkpathDest(cover, file.path);
				if (attachment) {
					const src = this.app.vault.getResourcePath(attachment);
					if (src) {
						return src;
					}
				}
			}
		}
		return null;
	}
}
