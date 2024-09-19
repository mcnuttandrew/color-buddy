export const lintGroupNames: Record<string, string> = {
  design: "Design",
  usability: "Usability",
  "color-accessibility": "Color accessibility (CVD)",
  "contrast-accessibility": "Contrast accessibility (WCAG)",
  custom: "Custom",
};

export const typeToSymbol = {
  design: "🎨",
  "contrast-accessibility": "♿",
  "color-accessibility": "♿",
  accessibility: "♿",
  usability: "🔎",
  custom: "⚙️",
} as any;

export const typeToImg = {
  design: "./design.png",
  "contrast-accessibility": "./wcag-object.png",
  "color-accessibility": "./cvd.png",
  accessibility: "./cvd.png",
  usability: "./distinctness.png",
  custom: "./Subtract.png",
} as any;

export const deltaMetrics = ["76", "CMC", "2000", "ITP"] as const;
export const contrastMetrics = [
  "APCA",
  "WCAG21",
  "Michelson",
  "Weber",
  "Lstar",
  "DeltaPhi",
] as const;
