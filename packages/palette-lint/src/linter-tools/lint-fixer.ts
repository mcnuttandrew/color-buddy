import type { Palette } from "@color-buddy/palette";
import type { LintResult } from "../ColorLint";

export type LintFixer = (pal: Palette, lint: LintResult) => Promise<Palette[]>;
import { fixBackgroundDifferentiability } from "../lints/background-contrast";
import { fixColorNameDiscriminability } from "../lints/name-discrim";
import { fixDivergingOrder } from "../lints/diverging-order";
import { fixGamut } from "../lints/in-gamut";
import { fixMaxColors } from "../lints/max-colors";
import { fixSequentialOrder } from "../lints/sequential-order";
import {
  fixLightnessDistribution,
  fixHueDistribution,
} from "../lints/even-distribution";
const fixDirectory: Record<string, LintFixer> = {
  fixBackgroundDifferentiability,
  fixColorNameDiscriminability,
  fixDivergingOrder,
  fixGamut,
  fixHueDistribution,
  fixLightnessDistribution,
  fixMaxColors,
  fixSequentialOrder,
};

export async function suggestLintFix(
  palette: Palette,
  lint: LintResult,
  _engine?: string
): Promise<Palette[]> {
  if (lint.kind !== "success") return [];
  const sub = lint.lintProgram.subscribedFix;
  if (sub && fixDirectory[sub]) {
    return fixDirectory[sub](palette, lint);
  }
  // console.log("check failed", lint, fixDirectory);
  return [];
}
