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

// Todo make this connect with the color system
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
export type ColorWrap<A> = {
  // markType:
  //   | undefined
  //   | "line"
  //   | "point"
  //   | "bar"
  //   | "area"
  //   | "text"
  //   | "background";
  // size: undefined | "small" | "medium" | "large";
  tags: string[];
  color: A;
};
type Pal<A> = {
  background: A;
  colorSpace: ColorSpace;
  colors: ColorWrap<A>[];
  evalConfig: Record<string, any>;
  intendedAffects: Affect[];
  intendedContexts: Context[];
  name: string;
  type: PalType;
};
export type PalType = "sequential" | "diverging" | "categorical";
export type Palette = Pal<Color>;
export type StringPalette = Pal<string>;
