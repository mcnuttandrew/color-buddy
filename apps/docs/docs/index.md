---
# https://vitepress.dev/reference/default-theme-home-page
layout: doc
---

# Color Buddy

This is the documentation page for our tool [Color Buddy](https://color-buddy.netlify.app/). The goal of Color Buddy is to help you make excellent color palettes for data visualization via a direct manipulation environment that evaluates your color palettes as you go. The easiest way to get started with Color Buddy is just to jump right in and start messing around with it!

Color Buddy's design is inspired by vector graphics manipulation tools, such as Figma and the like. In it you can specify palettes via direct manipulation, wherein you drag and drop colors in any of a variety of color spaces to be whatever color you want them to be. To learn more about the basic interactions in Color Buddy see the tour in the application.

We check color palettes through a checker called [Palette Lint](./x/palette-lint.html). Like other linters, palette lint takes in a collection of checks and palette and evaluate the palette for each of those checks. If this is not familiar, that's okay! Think of it like a spell checker for color. This tool is built on the back of several other libraries, the details of which are not essential for just making color palettes (unless you want to do something with it programmatically).

To learn more about some of the ideas behind this work, see our paper describing the system [Mixing Linters with GUIs: A Color Palette Design Probe](https://arxiv.org/abs/2407.21285).
