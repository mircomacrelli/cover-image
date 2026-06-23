import {MarkdownView, Plugin, TFile, WorkspaceLeaf} from 'obsidian';
import {SELECTORS, COVER_CONTAINER, IMAGE_TYPES} from './constants';


export default class CoverImage extends Plugin {
    async onload(): Promise<void> {
        console.debug('loading plugin cover-image');

        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.updateLeaves();
            })
        );

        this.registerEvent(
            this.app.metadataCache.on('changed', (file: TFile) => {
                this.updateLeaves(file);
            })
        );

        this.app.workspace.onLayoutReady(() => {
            this.updateLeaves();
        });
    }

    onunload(): void {
        this.app.workspace.iterateAllLeaves((leaf) => {
            const [view] = this.getViewAndFile(leaf);
            if (view) {
                this.removeCover(view);
            }
        });
        console.debug('unloaded plugin cover-image');
    }

    private updateLeaves(modified: TFile | null = null): void {
        this.app.workspace.iterateAllLeaves((leaf) => {
            const [view, file] = this.getViewAndFile(leaf, modified);
            if (view && file) {
                const cover = this.getCover(file);
                if (cover) {
                    this.updateCover(cover, view);
                } else {
                    this.removeCover(view);
                }
            }
        });
    }

    private updateCover(cover: string, view: MarkdownView): void {
        const current = SELECTORS.get(view.getMode());
        for (const selector of SELECTORS.values()) {
            const container = view.containerEl.querySelector(selector);
            if (container) {
                let div = container.querySelector(`.${COVER_CONTAINER}`);
                if (selector === current) {
                    if (!div) {
                        div = createDiv({cls: COVER_CONTAINER});
                    }
                    let img = div.firstElementChild;
                    if (!img) {
                        img = createEl('img');
                        div.append(img);
                    }
                    if (cover !== img.getAttribute('src')) {
                        img.setAttribute('src', cover);
                    }
                    if (!div.parentElement) {
                        container.prepend(div);
                    }
                } else {
                    if (div) {
                        container.removeChild(div);
                    }
                }
            }
        }
    }

    private removeCover(view: MarkdownView): void {
        for (const selector of SELECTORS.values()) {
            const container = view.contentEl.querySelector(selector);
            if (container) {
                let div = container.querySelector(`.${COVER_CONTAINER}`);
                if (div) {
                    div.remove();
                }
            }
        }
    }

    private getViewAndFile(leaf: WorkspaceLeaf, modified: TFile | null = null): [view: MarkdownView | null, file: TFile | null] {
        if (!leaf.isDeferred) {
            const view = leaf.view;
            if (view instanceof MarkdownView) {
                const file = view.file;
                if (file && file.extension === 'md') {
                    if (!modified || modified.path === file.path) {
                        return [view, file];
                    }
                }
            }
        }
        return [null, null];
    }

    private getCover(file: TFile): string | null {
        const metadata = this.app.metadataCache.getFileCache(file);
        if (metadata) {
            const frontmatter = metadata.frontmatter;
            if (frontmatter) {
                const cover = frontmatter.cover as string;
                if (cover && cover.startsWith('[[') && cover.endsWith(']]')) {
                    const path = cover.slice(2, -2).trim();
                    const attachment = this.app.metadataCache.getFirstLinkpathDest(path, file.path);
                    if (attachment && IMAGE_TYPES.has(attachment.extension)) {
                        return this.app.vault.getResourcePath(attachment);
                    }
                }
            }
        }
        return null;
    }
}
