# Palette Lint

Have you ever looked closely at a color palette and wondered if it was a good palette or just the one you had? Palette Lint is a tool that helps you evaluate the quality of a color palette. It operates analogously to a spell checker (or more closely, like a linter), but for color palettes. It will help you identify issues with your palette and suggest improvements.

Palette lint's usage is centered around Color library, that, in turn wraps the extremely powerful [colorjs.io](https://colorjs.io/).

Palette lint exports the following packages:

```ts
export {
  // a collection of pre built lints, see https://color-buddy-docs.netlify.app/lang-examples.html for more details
  PREBUILT_LINTS,
  // The linter class that is used to lint a palette
  ColorLint,
  // a Function that creates a custom lint from
  CreateCustomLint,
  colorNameSimple,
  generateMCFix,
  linter,
  simulateCVD,
  suggestLintFix,
};
export type {
  Palette,
  StringPalette,
  ColorWrap,
  LintResult,
  CustomLint,
  ColorSpace,
};
```

Example usage todo! For now see the test files for examples.
