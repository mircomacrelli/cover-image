import {
    CachedMetadata,
    debounce,
    Debouncer,
    FrontMatterCache,
    MarkdownView,
    Plugin,
    TFile,
    View,
    WorkspaceLeaf
} from 'obsidian';
import {SELECTORS, COVER_CONTAINER, IMAGE_TYPES, DEFAULT_SETTINGS} from './constants';
import {CoverImageSettings} from './CoverImageSettings';
import {CoverImageSettingsTab} from './CoverImageSettingsTab';


export default class CoverImage extends Plugin {
    settings: CoverImageSettings = DEFAULT_SETTINGS;

    readonly updateAll: Debouncer<[], void> = debounce((): void => {
        this.updateLeaves();
    }, 500);

    readonly updateFile: Debouncer<[modified: TFile | null], void> = debounce((modified: TFile | null) => {
        this.updateLeaves(modified);
    }, 500);

    async onload(): Promise<void> {
        await this.loadSettings();

        this.addSettingTab(new CoverImageSettingsTab(this.app, this));

        this.registerEvent(
            this.app.workspace.on('layout-change', (): void => {
                this.updateLeaves();
            })
        );

        this.registerEvent(
            this.app.metadataCache.on('changed', (file: TFile): void => {
                this.updateFile(file);
            })
        );

        this.app.workspace.onLayoutReady((): void => {
            this.updateLeaves();
        });
    }

    onunload(): void {
        this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf): void => {
            const [view] = this.getViewAndFile(leaf);
            if (view) {
                this.removeCover(view);
            }
        });
    }

    private async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as CoverImageSettings);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    private updateLeaves(modified: TFile | null = null): void {
        this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf): void => {
            const [view, file] = this.getViewAndFile(leaf, modified);
            if (view && file) {
                const cover: string | null = this.getCover(file);
                if (cover) {
                    this.updateCover(cover, view);
                } else {
                    this.removeCover(view);
                }
            }
        });
    }

    private updateCover(cover: string, view: MarkdownView): void {
        const current: string | undefined = SELECTORS.get(view.getMode());
        for (const selector of SELECTORS.values()) {
            const container: Element | null = view.containerEl.querySelector(selector);
            if (container) {
                let div: Element | null = container.querySelector(`.${COVER_CONTAINER}`);
                if (div) {
                    if (selector === current) {
                        const img: Element | null = div.firstElementChild;
                        if (img && cover !== img.getAttribute('src')) {
                            img.setAttribute('src', cover);
                        }
                    } else {
                        container.removeChild(div);
                    }
                } else {
                    if (selector === current) {
                        div = createDiv({cls: COVER_CONTAINER});
                        const img: Element = createEl('img');
                        img.setAttribute('src', cover);
                        div.append(img);
                        container.prepend(div);
                    }
                }
            }
        }
    }

    private removeCover(view: MarkdownView): void {
        for (const selector of SELECTORS.values()) {
            const container: Element | null = view.contentEl.querySelector(selector);
            if (container) {
                let div: Element | null = container.querySelector(`.${COVER_CONTAINER}`);
                if (div) {
                    div.remove();
                }
            }
        }
    }

    private getViewAndFile(leaf: WorkspaceLeaf, modified: TFile | null = null): [view: MarkdownView | null, file: TFile | null] {
        if (!leaf.isDeferred) {
            const view: View = leaf.view;
            if (view instanceof MarkdownView) {
                const file: TFile | null = view.file;
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
        const metadata: CachedMetadata | null = this.app.metadataCache.getFileCache(file);
        if (metadata) {
            const frontmatter: FrontMatterCache | undefined = metadata.frontmatter;
            if (frontmatter) {
                const cover = frontmatter[this.settings.propertyName] as string;
                if (cover && cover.startsWith('[[') && cover.endsWith(']]')) {
                    const path: string = cover.slice(2, -2).trim();
                    const attachment: TFile | null = this.app.metadataCache.getFirstLinkpathDest(path, file.path);
                    if (attachment && IMAGE_TYPES.has(attachment.extension)) {
                        return this.app.vault.getResourcePath(attachment);
                    }
                }
            }
        }
        return null;
    }
}
