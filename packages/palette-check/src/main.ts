import type { Palette, StringPalette, ColorWrap, ColorSpace } from "./types";

import { colorNameSimple } from "./lints/name-discrim";

import { Color, ColorSpaceDirectory } from "./Color";

import { PREBUILT_LINTS, runLintChecks } from "./linter";

import { CreateCustomLint, ColorLint } from "./ColorLint";
import type { LintResult, CustomLint } from "./ColorLint";

import { doMonteCarloFix } from "./linter-tools/monte-carlo-fix";

import simulateCVD from "./cvd-sim";

import {
  clipToGamut,
  createPalFromHexes,
  distributePoints,
  makePal,
  makePalFromString,
  toHex,
  toPal,
  wrapInBlankSemantics,
  wrapInBlankStringSemantics,
} from "./utils";

import { suggestLintFix } from "./linter-tools/lint-fixer";

export {
  PREBUILT_LINTS,
  Color,
  ColorLint,
  ColorSpaceDirectory,
  CreateCustomLint,
  clipToGamut,
  colorNameSimple,
  createPalFromHexes,
  distributePoints,
  doMonteCarloFix,
  makePal,
  makePalFromString,
  runLintChecks,
  simulateCVD,
  suggestLintFix,
  toHex,
  toPal,
  wrapInBlankSemantics,
  wrapInBlankStringSemantics,
};
export type {
  Palette,
  StringPalette,
  ColorWrap,
  LintResult,
  CustomLint,
  ColorSpace,
};
