import { Color, ColorSpaceDirectory } from "./Color";

export type ColorSpace = keyof typeof ColorSpaceDirectory;

type Pal<A, B> = {
  background: B;
  colorSpace: ColorSpace;
  colors: A[];
  evalConfig: Record<string, any>;
  tags: string[];
  name: string;
  type: PalType;
};
export type PalType = "sequential" | "diverging" | "categorical";
export type Palette = Pal<Color, Color>;
export type StringPalette = Pal<{ color: string; tags: string[] }, string>;
