import type { Palette, StringPalette, ColorWrap, ColorSpace } from "./types";

import { colorNameSimple } from "./lints/name-discrim";

import { Color, ColorSpaceDirectory } from "./Color";

import { BUILT_INS, runLintChecks } from "./linter";

import { CreateCustomLint, ColorLint } from "./ColorLint";
import type { LintResult, CustomLint } from "./ColorLint";

import { doMonteCarloFix } from "./linter-tools/monte-carlo-fix";

import simulateCVD from "./cvd-sim";

import {
  wrapInBlankSemantics,
  wrapInBlankStringSemantics,
  makePal,
  toHex,
  distributePoints,
  clipToGamut,
  createPalFromHexes,
  createPalWithTags,
  makePalFromString,
  toPal,
} from "./utils";

import { suggestLintFix } from "./linter-tools/lint-fixer";

export {
  runLintChecks,
  Color,
  ColorSpaceDirectory,
  BUILT_INS,
  CreateCustomLint,
  ColorLint,
  colorNameSimple,
  simulateCVD,
  doMonteCarloFix,
  wrapInBlankSemantics,
  suggestLintFix,
  makePal,
  toHex,
  distributePoints,
  clipToGamut,
  wrapInBlankStringSemantics,
  createPalFromHexes,
  createPalWithTags,
  makePalFromString,
  toPal,
};
export type {
  Palette,
  StringPalette,
  ColorWrap,
  LintResult,
  CustomLint,
  ColorSpace,
};
