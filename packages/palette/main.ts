import {
  makePalFromString,
  toPal,
  clipToGamut,
  distributePoints,
} from "./src/utils";
import type { Palette, StringPalette, ColorSpace, PalType } from "./src/types";
import { Color, ColorSpaceDirectory } from "./src/Color";
import cvdSim from "./src/cvd-sim";
export {
  toPal,
  makePalFromString,
  Color,
  ColorSpaceDirectory,
  distributePoints,
  clipToGamut,
  cvdSim,
};

export type { Palette, StringPalette, ColorSpace, PalType };
