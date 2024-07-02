import { Color, ColorSpaceDirectory } from "./Color";

/**
 * A collection of color space that are usable with this color library.
 */
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

/**
 * A palette where the colors are represented as Color objects. Good for programmatic use.
 */
export type Palette = Pal<Color, Color>;

/**
 * A palette where the colors are represented as strings. Good for serialization or storage. Expects color to be represented as {color: string, tags: string[]} objects.
 */
export type StringPalette = Pal<{ color: string; tags: string[] }, string>;
