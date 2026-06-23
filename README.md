# Cover Image

Automatically include the image linked in the property `cover` at the top of the note body.

## Usage

To add a cover to the top of your note, add a property called `cover` to the note's frontmatter, then add a link to the
image you want to use as the cover.

Example:

```markdown
---
cover: [[An Image.jpeg]]
---
```

The maximum width and height of the cover image are limited by default to 256 pixels. This value can be controlled
by changing the two CSS variables `--cover-image-max-width` and `--cover-image-max-height`. To change the margins, 
or the padding of the container, the default values for the class `.cover-container` can be changed. 