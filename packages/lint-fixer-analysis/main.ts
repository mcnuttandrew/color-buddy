// import outfits from "./pals/outfits.json";
// import tableauColors from "./pals/tableau-colors.json";
import brewerColors from "./pals/small-brewer.json";
import fs from "fs/promises";
import {
  PREBUILT_LINTS,
  linter,
  suggestMCFix,
  suggestLintFix,
} from "@color-buddy/palette-lint";
import type { LintProgram } from "@color-buddy/palette-lint";
import { Palette, makePalFromString } from "@color-buddy/palette";

import prompter from "./prompter";

// const palSets = pals as Record<string, { type: string; colors: string[] }>;
const brewerSets = brewerColors as {
  name: string;
  colors: string[];
  type: string;
}[];
// const tableauSets = tableauColors as {
//   type: string;
//   colors: string[];
//   name: string;
// }[];
// const outfitSets = outfits as {
//   name: string;
//   fill1: string;
//   fill2: string;
//   fill3: string;
// }[];
// function lookupBrewerSchemeType(schemeName: string): string {
//   return (
//     Object.keys(brewerSets.schemeGroups).find(([_type, schemes]) =>
//       schemes.includes(schemeName)
//     )?.[0] || "categorical"
//   );
// }

// make all of these into a database of palettes
const allSets = [
  // ...Object.entries(palSets).map(([name, { type, colors }]) => ({
  //   name,
  //   type,
  //   colors,
  // })),
  ...brewerSets,
  // ...Object.entries(brewerSets)
  //   .filter((x) => x[0] !== "schemeGroups")
  //   .flatMap(([name, schemeGroup]: any) =>
  //     Object.entries(schemeGroup).map(([size, colors]) => ({
  //       name: `${name}-${size}`,
  //       type: lookupBrewerSchemeType(name),
  //       colors: colors as string[],
  //     }))
  //   ),

  // ...tableauSets.map(({ type, colors, name }) => ({
  //   name,
  //   type,
  //   colors,
  // })),
  // ...outfitSets.map(({ name, fill1, fill2, fill3 }) => ({
  //   name,
  //   type: "categorical",
  //   colors: [fill1, fill2, fill3],
  // })),
].flatMap((x) => {
  return ["black", "white"].map((background) => {
    const newPal = makePalFromString(x.colors, background);
    newPal.name = x.name;
    newPal.type = x.type as any;
    return newPal;
  });
});

function lintPasses(pal: Palette, lint: LintProgram): boolean {
  const result = linter(pal, [lint], {})[0];
  return result.kind === "success" && result.passes;
}
// .slice(0, 2);
async function main() {
  // for each prebuilt lint, run it on each palette, record the result
  interface ResultType {
    lintName: string;
    paletteName: string;
    passing: boolean;
    description: string;
    message: string;
    colors: string[];
    background: string;
    blamedColors: number[] | number[][];
    heuristicFixPasses: "pass" | "fail" | "unavailable" | "NA";
    mcFixPasses: boolean | "NA";
    openAIFixPasses: boolean | "NA";
    anthropicFixPasses: boolean | "NA";
  }
  const results = [] as ResultType[];
  // for (const lint of PREBUILT_LINTS) {
  for (const lint of PREBUILT_LINTS) {
    console.log(`Running ${lint.name}`);
    for (let idx = 0; idx < allSets.length; idx++) {
      console.log(`${idx} / ${allSets.length}`);
      const pal = allSets[idx];
      const result = linter(pal, [lint], { computeMessage: true })[0];
      if (result.kind !== "success") {
        continue;
      }

      const measurement: ResultType = {
        lintName: lint.name,
        paletteName: pal.name,
        passing: result.passes,
        description: result.lintProgram.description,
        message: result.message,
        blamedColors: result.blameData,
        colors: pal.colors.map((x) => x.toString()),
        background: pal.background.toString(),
        heuristicFixPasses: "NA",
        mcFixPasses: "NA",
        openAIFixPasses: "NA",
        anthropicFixPasses: "NA",
      };
      if (result.passes === false) {
        console.log("no pass");
        const errMsg = result.message;
        await Promise.all([
          suggestLintFix(pal, result).then((heuristicFix) => {
            measurement.heuristicFixPasses =
              heuristicFix.length > 0
                ? lintPasses(heuristicFix[0], lint)
                  ? "pass"
                  : "fail"
                : "unavailable";
          }),
          Promise.resolve().then(() => {
            const mcFix = suggestMCFix(pal, [lint]);
            measurement.mcFixPasses = lintPasses(mcFix, lint);
          }),
          getPromptedSuggestion(pal, "openai", errMsg).then((suggestions) => {
            if (suggestions.length === 0 || !Array.isArray(suggestions)) {
              measurement.openAIFixPasses = false;
              return;
            }
            const suggestion = suggestions[0];
            const newPal = makePalFromString(
              suggestion.colors,
              suggestion.background
            );
            newPal.background = pal.background;
            measurement.openAIFixPasses = lintPasses(newPal, lint);
          }),

          getPromptedSuggestion(pal, "anthropic", errMsg).then(
            (suggestions) => {
              if (suggestions.length === 0 || !Array.isArray(suggestions)) {
                measurement.anthropicFixPasses = false;
                return;
              }
              const suggestion = suggestions[0];
              const newPal = makePalFromString(
                suggestion.colors,
                suggestion.background
              );
              measurement.anthropicFixPasses = lintPasses(newPal, lint);
            }
          ),
        ]);
      } else {
        console.log("pass");
      }

      results.push(measurement);
      await fs.writeFile(
        "./analysis-output/results.json",
        JSON.stringify(results, null, 2)
      );
    }
  }
}

function getPromptedSuggestion(pal: Palette, engine: string, error: string) {
  return prompter(
    pal.colors.map((x) => x.color.toString()),
    pal.background.toString(),
    error,
    `This is a ${pal.type} palette called '${pal.name}'`,
    engine
  );
}

main();
