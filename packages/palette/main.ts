import {
  makePalFromString,
  toPal,
  wrapColor,
  clipToGamut,
  distributePoints,
} from "./src/utils";
import type {
  Palette,
  StringPalette,
  ColorWrap,
  ColorSpace,
  PalType,
} from "./src/types";
import { Color, ColorSpaceDirectory } from "./src/Color";
export {
  toPal,
  wrapColor,
  makePalFromString,
  Color,
  ColorSpaceDirectory,
  distributePoints,
  clipToGamut,
};

export type { Palette, StringPalette, ColorWrap, ColorSpace, PalType };
