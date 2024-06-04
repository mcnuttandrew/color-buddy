import { Color } from "./Color";
import type { ColorSpace as LintColorSpace } from "./lint-language/lint-type";

export type ColorSpace = LintColorSpace;

export type ColorWrap<A> = {
  tags: string[];
  color: A;
};
type Pal<A> = {
  background: A;
  colorSpace: ColorSpace;
  colors: ColorWrap<A>[];
  evalConfig: Record<string, any>;
  tags: string[];
  name: string;
  type: PalType;
};
export type PalType = "sequential" | "diverging" | "categorical";
export type Palette = Pal<Color>;
export type StringPalette = Pal<string>;
