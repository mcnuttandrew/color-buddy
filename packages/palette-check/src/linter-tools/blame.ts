import { LLEval } from "../lint-language/lint-language";
import type { LintProgram } from "../lint-language/lint-type";
import type { Palette } from "../types";

export function permutativeBlame(
  root: LintProgram,
  palette: Palette,
  mode: "single" | "pair"
): number[] | number[][] {
  const initialRun = LLEval(root, palette);
  if (initialRun.result) return [];
  // dont compute blame if it doesn't matter
  const hasColorsRef = JSON.stringify(root).includes("colors");
  const hasBgRef = JSON.stringify(root).includes("background");
  if (!hasColorsRef && !hasBgRef) {
    return [];
  }

  // single blame
  const allIndices = palette.colors.map((_, i) => i);
  let blamedIndices = [] as number[];
  if (mode === "single") {
    // constructive blame
    allIndices.forEach((x) => {
      const tempPalette = { ...palette, colors: [palette.colors[x]] };
      const result = LLEval(root, tempPalette);
      if (!result.result) {
        blamedIndices.push(x);
      }
    });
    if (blamedIndices.length > 0) return blamedIndices;
    blamedIndices = palette.colors
      .map((_, i) => {
        const tempPalette = {
          ...palette,
          colors: palette.colors.filter((_, j) => i !== j),
        };
        const result = LLEval(root, tempPalette);
        // if it passes then this index is the problem

        return result.result ? i : -1;
      })
      .filter((x) => x !== -1);
  } else if (mode === "pair") {
    // pair blame
    // todo add trimming as appropriate
    let checkIndices = new Set<string>();
    const pairBlame = [] as number[][];
    // constructive blame
    allIndices.forEach((x) => {
      allIndices.forEach((y) => {
        if (x === y) return;
        const key = [x, y].sort().join(",");
        if (checkIndices.has(key)) return;
        checkIndices.add(key);
        const tempPalette = {
          ...palette,
          colors: [palette.colors[x], palette.colors[y]],
        };
        const result = LLEval(root, tempPalette);
        if (!result.result) {
          pairBlame.push([x, y]);
        }
      });
      if (pairBlame.length > 0) return pairBlame;
      // reductive blame
      blamedIndices.forEach((x) => {
        blamedIndices.forEach((y) => {
          const key = [x, y].sort().join(",");
          if (checkIndices.has(key)) return;
          if (x === y) return;
          checkIndices.add(key);
          // try out filter the pairs of blamed indices as pairs
          const tempPalette = {
            ...palette,
            colors: palette.colors.filter((_, j) => x !== j && y !== j),
          };
          const result = LLEval(root, tempPalette);
          if (result.result) {
            pairBlame.push([x, y]);
          }
        });
      });
    });

    return pairBlame;
  }
  if (blamedIndices.length === 0) {
    blamedIndices = [...allIndices];
  }

  return blamedIndices;
}
