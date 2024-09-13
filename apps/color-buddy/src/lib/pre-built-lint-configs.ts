// for setting the default allowed lints
export const DEFAULT_LINT_LIST = [
  "Medium-discrim-built-in",
  //   "Thin-discrim-built-in",
  "Wide-discrim-built-in",
  "background-contrast-built-in",
  "cat-order-similarity-built-in",
  "color-name-discriminability-built-in",
  "contrast-aa-built-in",
  "contrast-aaa-built-in",
  "contrast-graphical-objects-built-in",
  "cvd-friendly-deuteranopia-built-in",
  "cvd-friendly-protanopia-built-in",
  "cvd-friendly-tritanopia-built-in",
  "diverging-built-in",
  //   "extreme-colors-built-in",
  "gamut-check-built-in",
  "mutually-distinct-built-in",
  "sequential-order-built-in",
  "too-many-colors-built-in",
  "ugly-colors-built-in",
  //   "contrast-aa-all-built-in",
  //   "contrast-aaa-built-in",
  //   "dark-reds-browns-positive-built-in",
  //   "saturated-calm-built-in",
  //   "saturated-serious-built-in",
  //   "saturated-trustworthy-built-in",
  // "avoid-green-built-in",
  // "avoid-tetradic-built-in",
  // "avoid-too-much-contrast-with-the-background-built-in",
  // "background-de-saturation-built-in",
  // "cvd-friendly-grayscale-built-in",
  // "discrim-power-built-in",
  // "even-colors-built-in",
  // "fair-nominal-built-in",
  // "fair-sequential-built-in",
  // "light-blues-beiges-grays-playful-built-in",
  // "light-colors-greens-negative-built-in",
  // "require-color-complements-built-in",
];

export const STRICT_LINT_LIST = [
  "Medium-discrim-built-in",
  "Thin-discrim-built-in",
  "Wide-discrim-built-in",
  "avoid-too-much-contrast-with-the-background-built-in",
  "cat-order-similarity-built-in",
  "color-name-discriminability-built-in",
  "contrast-aa-all-built-in",
  "contrast-aaa-all-built-in",
  "contrast-graphical-objects-built-in",
  "cvd-friendly-deuteranopia-built-in",
  "cvd-friendly-grayscale-built-in",
  "cvd-friendly-protanopia-built-in",
  "cvd-friendly-tritanopia-built-in",
  "diverging-built-in",
  "even-colors-built-in",
  "even-colors-lightness-built-in",
  //   "extreme-colors-built-in",
  "gamut-check-built-in",
  "mutually-distinct-built-in",
  "sequential-order-built-in",
  "too-many-colors-built-in",
  "ugly-colors-built-in",
  //   "avoid-green-built-in",
  //   "avoid-tetradic-built-in",
  //   "background-de-saturation-built-in",
  //   "contrast-aa-built-in",
  //   "contrast-aaa-built-in",
  //   "dark-reds-browns-positive-built-in",
  //   "fair-nominal-built-in",
  //   "fair-sequential-built-in",
  //   "light-blues-beiges-grays-playful-built-in",
  //   "light-colors-greens-negative-built-in",
  //   "require-color-complements-built-in",
  //   "saturated-calm-built-in",
  //   "saturated-serious-built-in",
  //   "saturated-trustworthy-built-in",
  //   "whisper-scream-built-in",
  //   "blue-basic-color-term-built-in",
];

export const COLOR_OPINIONATED = [
  "Medium-discrim-built-in",
  "Thin-discrim-built-in",
  "Wide-discrim-built-in",
  "avoid-green-built-in",
  "avoid-tetradic-built-in",
  "avoid-too-much-contrast-with-the-background-built-in",
  "background-de-saturation-built-in",
  "blue-basic-color-term-built-in",
  "cat-order-similarity-built-in",
  "color-name-discriminability-built-in",
  //   "contrast-aa-all-built-in",
  "contrast-aa-built-in",
  //   "contrast-aaa-all-built-in",
  "contrast-aaa-built-in",
  "contrast-graphical-objects-built-in",
  "cvd-friendly-deuteranopia-built-in",
  //   "cvd-friendly-grayscale-built-in",
  "cvd-friendly-protanopia-built-in",
  //   "cvd-friendly-tritanopia-built-in",
  "dark-reds-browns-positive-built-in",
  "diverging-built-in",
  "even-colors-built-in",
  "even-colors-lightness-built-in",
  "extreme-colors-built-in",
  "fair-nominal-built-in",
  "fair-sequential-built-in",
  "gamut-check-built-in",
  "light-blues-beiges-grays-playful-built-in",
  "light-colors-greens-negative-built-in",
  "mutually-distinct-built-in",
  "require-color-complements-built-in",
  "saturated-calm-built-in",
  "saturated-serious-built-in",
  "saturated-trustworthy-built-in",
  "sequential-order-built-in",
  "too-many-colors-built-in",
  "ugly-colors-built-in",
  "whisper-scream-built-in",
];

export const lintPacks = [
  {
    name: "Default",
    lints: DEFAULT_LINT_LIST,
    description: "A good starting point for most projects",
  },
  {
    name: "Strict",
    lints: STRICT_LINT_LIST,
    description: "Requires strict adherence to accessibility concerns",
  },
  {
    name: "Color Opinionated",
    lints: COLOR_OPINIONATED,
    description:
      "Some opinionated about color choices. Uses scheme tags (e.g. 'serious') to work",
  },
];
