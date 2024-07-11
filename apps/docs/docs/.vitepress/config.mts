import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Color Buddy Docs",
  description: "Documentation for Color Buddy and Palette Lint ",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.png",
    nav: [
      { text: "Home", link: "/" },
      { text: "Live", link: "https://radiant-speculoos-7f8b2f.netlify.app/" },
    ],

    sidebar: [
      {
        text: "Color Buddy",
        items: [{ text: "Introduction", link: "/" }],
      },
      {
        text: "Packages",
        items: [
          { text: "Palette", link: "/x/palette" },
          { text: "Palette Lint", link: "/x/palette-lint" },
          { text: "Color Namer", link: "/x/color-namer" },
        ],
      },
      {
        text: "Palette Lint",
        items: [
          { text: "Language Docs", link: "/lang-docs" },
          { text: "Examples", link: "/lang-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/mcnuttandrew/color-buddy" },
    ],
    search: {
      provider: "local",
    },
  },
});
