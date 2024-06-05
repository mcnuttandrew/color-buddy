import type { Palette, StringPalette, ColorWrap, ColorSpace } from "./types";

import { colorNameSimple } from "./lints/name-discrim";

import { Color, ColorSpaceDirectory } from "./Color";

import { PREBUILT_LINTS, linter } from "./linter";

import { CreateCustomLint, ColorLint } from "./ColorLint";
import type { LintResult, CustomLint } from "./ColorLint";

import { generateMCFix } from "./linter-tools/monte-carlo-fix";

import simulateCVD from "./cvd-sim";

import {
  clipToGamut,
  distributePoints,
  makePalFromString,
  toPal,
  wrapSemantics,
} from "./utils";

import { suggestLintFix } from "./linter-tools/lint-fixer";

const utils = {
  toPal,
  wrapSemantics,
  makePalFromString,
};
export {
  PREBUILT_LINTS,
  Color,
  ColorLint,
  ColorSpaceDirectory,
  CreateCustomLint,
  clipToGamut,
  colorNameSimple,
  distributePoints,
  generateMCFix,
  linter,
  simulateCVD,
  suggestLintFix,
  utils,
};
export type {
  Palette,
  StringPalette,
  ColorWrap,
  LintResult,
  CustomLint,
  ColorSpace,
};
