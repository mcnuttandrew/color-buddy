import { Color } from "./lib/Color";

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
type Pal<A> = {
  background: A;
  colorSpace: ColorSpace;
  colors: A[];
  evalConfig: Record<string, any>;
  name: string;
  type: PalType;
};
export type PalType = "sequential" | "diverging" | "categorical";
export type Palette = Pal<Color>;
export type StringPalette = Pal<string>;
