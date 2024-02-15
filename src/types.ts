import { Color } from "./lib/Color";

export const affects = [
  "calm",
  "exciting",
  "positive",
  "negative",
  "serious",
  "playful",
  "trustworthy",
  "disturbing",
];
export type Affect = (typeof affects)[number];
export const contexts = ["scatterplot", "linechart", "barchart", "dashboard"];

export type Context = (typeof contexts)[number];

// Todo make this connect witht the color system
export type ColorSpace =
  | "lab"
  | "hsl"
  | "hsv"
  | "jzazbz"
  | "lch"
  | "oklab"
  | "oklch"
  | "rgb"
  | "srgb";

// pretty nervous about the role stuff bc it will mean a lot of index manipulation to keep things straight when things get reordered
type ColorSemantics = {
  role?: "background" | "text" | "accent" | "de-emphasize" | "main";
  size?: "small" | "medium" | "large";
  // what does main mean?
  use?: "main" | "accent" | "de-emphasize";
};
type Pal<A> = {
  background: A;
  colorSpace: ColorSpace;
  colors: A[];
  evalConfig: Record<string, any>;
  name: string;
  type: PalType;
  intendedAffects: Affect[];
  intendedContexts: Context[];
  // todo: colorRole: Role[]
};
export type PalType = "sequential" | "diverging" | "categorical";
export type Palette = Pal<Color>;
export type StringPalette = Pal<string>;
