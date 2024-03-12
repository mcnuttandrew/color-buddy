import type { Palette } from "../../types";
import type { LintResult } from "../ColorLint";
import { suggestFix } from "../api-calls";
import { Color } from "../Color";
import { wrapInBlankSemantics } from "../utils";

export async function suggestLintAIFix(
  palette: Palette,
  lint: LintResult,
  engine: string
): Promise<Palette[]> {
  const colorSpace = palette.colorSpace;
  const msg = `${lint.message}\n\nFailed: ${lint.naturalLanguageProgram}`;
  return suggestFix(palette, msg, engine as any).then((x) => {
    if (x.length === 0) {
      throw new Error("No suggestions");
    }
    return x.map((el) => {
      try {
        return {
          ...palette,
          colors: el.colors.map((x) =>
            wrapInBlankSemantics(
              Color.colorFromHex(x.replace("##", "#"), colorSpace)
            )
          ),
        };
      } catch (e) {
        console.log(e);
        return palette;
      }
    });
  });
}

export type LintFixer = (pal: Palette, lint: LintResult) => Promise<Palette[]>;
import { fixBackgroundDifferentiability } from "../lints/background-contrast";
import { fixColorNameDiscriminability } from "../lints/name-discrim";
import { fixDivergingOrder } from "../lints/diverging-order";
import { fixGamut } from "../lints/in-gamut";
import { fixMaxColors } from "../lints/max-colors";
import { fixSequentialOrder } from "../lints/sequential-order";
const fixDirectory: Record<string, LintFixer> = {
  fixBackgroundDifferentiability,
  fixColorNameDiscriminability,
  fixDivergingOrder,
  fixGamut,
  fixMaxColors,
  fixSequentialOrder,
};

export async function suggestLintFix(
  palette: Palette,
  lint: LintResult,
  _engine?: string
): Promise<Palette[]> {
  if (fixDirectory[lint.subscribedFix]) {
    return fixDirectory[lint.subscribedFix](palette, lint);
  }
  console.log("check failed", lint, fixDirectory);
  return [];
}
