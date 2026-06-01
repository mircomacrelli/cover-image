import {MarkdownPostProcessor} from 'obsidian';
import {IMAGES, CONTAINERS} from './main'

export default class CoverMarkdownPostProcessor {
	instance(): MarkdownPostProcessor {
		return (el, ctx) => {
			if (!el.classList.contains('mod-frontmatter')) {
				return;
			}

			const cover = IMAGES.get(ctx.sourcePath);
			if (!cover) {
				return;
			}

			const container = el.createDiv();
			container.classList.add('cover-container');
			const img = container.createEl('img');
			img.setAttribute('src', cover);
			container.append(img);
			CONTAINERS.set(container, ctx.sourcePath);
			el.append(container);
		};
	}
}
