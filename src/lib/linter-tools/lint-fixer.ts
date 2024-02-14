import type { Palette } from "../../stores/color-store";
import { suggestFix } from "../api-calls";
import type { LintResult } from "../lints/ColorLint";
import { manualLints } from "../linter";
import { Color } from "../Color";

export async function suggestLintAIFix(
  palette: Palette,
  message: string,
  engine: string
) {
  const colorSpace = palette.colorSpace;
  return suggestFix(palette, message, engine as any).then((x) => {
    if (x.length === 0) {
      throw new Error("No suggestions");
    }
    return x.map((el) => {
      try {
        return {
          ...palette,
          colors: el.colors.map((x) =>
            Color.colorFromHex(x.replace("##", "#"), colorSpace)
          ),
        };
      } catch (e) {
        console.log(e);
        return palette;
      }
    });
  });
}

const fixDirectory: Record<string, any> = {};
manualLints.forEach((x) => {
  const demo = new x({} as any);
  const name = demo.name;
  if (demo.hasHeuristicFix) {
    fixDirectory[name] = x.suggestFix;
  }
});

export async function suggestLintFix(
  palette: Palette,
  lint: LintResult,
  _engine?: string
): Promise<Palette[]> {
  if (fixDirectory[lint.name]) {
    return fixDirectory[lint.name](palette);
  }
  console.log("check failed", lint.name, fixDirectory);
  return [];
}
