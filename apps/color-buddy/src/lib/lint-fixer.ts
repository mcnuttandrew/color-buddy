import { suggestFix, suggestMonteFix } from "./api-calls";
import { Color } from "@color-buddy/palette";
import type { Palette } from "@color-buddy/palette";
import type { LintResult } from "@color-buddy/palette-lint";

type SuggestFix = (
  pal: Palette,
  lint: LintResult,
  engine: string
) => Promise<Palette[]>;

function parsePalette(colors: string[], colorSpace: Palette["colorSpace"]) {
  return colors.map((x) =>
    Color.colorFromHex(x.replace("##", "#"), colorSpace)
  );
}

export const suggestLintAIFix: SuggestFix = async (palette, lint, engine) => {
  if (lint.kind !== "success") return [];

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
  if (lint.kind !== "success") return [];
  const colorSpace = palette.colorSpace;
  return suggestMonteFix(palette, [lint.lintProgram.id!]).then((newPal) => {
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
