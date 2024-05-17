import type { Palette } from "../../types";
import type { LintResult } from "../ColorLint";
import { suggestFix, suggestMonteFix } from "../api-calls";
import { Color } from "../Color";
import { wrapInBlankSemantics } from "../utils";

type SuggestFix = (
  pal: Palette,
  lint: LintResult,
  engine: string
) => Promise<Palette[]>;

function parsePalette(colors: string[], colorSpace: Palette["colorSpace"]) {
  return colors.map((x) =>
    wrapInBlankSemantics(Color.colorFromHex(x.replace("##", "#"), colorSpace))
  );
}

export const suggestLintAIFix: SuggestFix = async (palette, lint, engine) => {
  const colorSpace = palette.colorSpace;
  const msg = `${lint.message}\n\nFailed: ${lint.naturalLanguageProgram}`;
  return suggestFix(palette, msg, engine as any).then((x) => {
    if (x.length === 0) {
      throw new Error("No suggestions");
    }
    return x.map((el) => {
      try {
        return { ...palette, colors: parsePalette(el.colors, colorSpace) };
      } catch (e) {
        console.log(e);
        return palette;
      }
    });
  });
};

export const suggestLintMonteFix: SuggestFix = async (palette, lint) => {
  const colorSpace = palette.colorSpace;
  // todo abstract out this logic
  return suggestMonteFix(palette, [lint.id!]).then((newPal) => {
    if (newPal.length === 0) {
      throw new Error("No suggestions");
    }
    try {
      return [{ ...palette, colors: parsePalette(newPal, colorSpace) }];
    } catch (e) {
      console.log(e);
      return [palette];
    }
  });
};

export const suggestMultiLintMonteFix = async (
  palette: Palette,
  lints: LintResult[]
) => {
  const colorSpace = palette.colorSpace;
  return suggestMonteFix(
    palette,
    lints.map((x) => x.id!)
  ).then((newPal) => {
    if (newPal.length === 0) {
      throw new Error("No suggestions");
    }
    try {
      return [{ ...palette, colors: parsePalette(newPal, colorSpace) }];
    } catch (e) {
      console.log(e);
      return [palette];
    }
  });
};

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
  if (fixDirectory[lint.subscribedFix]) {
    return fixDirectory[lint.subscribedFix](palette, lint);
  }
  console.log("check failed", lint, fixDirectory);
  return [];
}
