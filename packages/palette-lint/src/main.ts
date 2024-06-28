import { PREBUILT_LINTS, linter } from "./linter";

import { CreateCustomLint, ColorLint } from "./ColorLint";
import type { LintResult, CustomLint } from "./ColorLint";

import { generateMCFix } from "./linter-tools/monte-carlo-fix";

import simulateCVD from "./cvd-sim";

import { suggestLintFix } from "./linter-tools/lint-fixer";

export {
  PREBUILT_LINTS,
  ColorLint,
  CreateCustomLint,
  generateMCFix,
  linter,
  simulateCVD,
  suggestLintFix,
};
export type { LintResult, CustomLint };
