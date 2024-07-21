import type { Palette } from "color-buddy-palette";

import { Color, ColorSpaceDirectory } from "color-buddy-palette";
import type { LintResult, LintProgram } from "../ColorLint";
import { RunLint } from "../ColorLint";

function getBlamedColors(palette: Palette, lintResult: LintResult): string[] {
  if (lintResult.kind !== "success" || lintResult.passes) {
    return [];
  }
  if (lintResult.lintProgram.blameMode === "pair") {
    return (lintResult.blameData as number[][]).flatMap((x) =>
      x.map((x) => palette.colors[x].toString())
    );
  } else {
    return (lintResult.blameData as number[]).map((x) =>
      palette.colors[x].toString()
    );
  }
}

/**
 * Suggest a fix using a monte-carlo inspired optimization algorithm. This function will take a palette and a list of lints and attempt to fix the palette by taking random steps in the color space until all lints pass.
 */
export const suggestMCFix = async (
  palette: Palette,
  lints: LintProgram[]
): Promise<Palette> => {
  // identify the step sizes for this color space
  const space = ColorSpaceDirectory[palette.colorSpace];
  const xStep = space.stepSize[1];
  const yStep = space.stepSize[2];
  const zStep = space.stepSize[0];
  const { x, y, z } = space.dimensionToChannel;
  const config = {
    xChannelIndex: space.channelNames.indexOf(x),
    yChannelIndex: space.channelNames.indexOf(y),
    zChannelIndex: space.channelNames.indexOf(z),
  };
  let newPalette = { ...palette };
  let passing = false;
  let stepCount = 0;
  while (!passing) {
    stepCount++;
    if (stepCount > 1000) {
      console.log("timed out");
      passing = true;
      break;
    }
    // run lints on new palette
    const lintResults = lints.map((lint) =>
      RunLint(lint, newPalette, { computeBlame: true, computeMessage: false })
    );
    if (lintResults.every((lint) => lint.kind === "success" && lint.passes)) {
      passing = true;
      break;
    }
    // generate blame for the new lints
    const blamedWithDuplicates = lintResults.flatMap((lint) =>
      getBlamedColors(newPalette, lint)
    );
    const blamed = [...new Set(blamedWithDuplicates)];
    newPalette.colors = [...newPalette.colors].map((color) => {
      // do nothing if the color is not blamed
      if (!blamed.includes(color.toString())) {
        return color;
      }
      // take random steps for each of the blamed colors
      const channels = color.toChannels();
      const newChannels = [...channels] as [number, number, number];
      newChannels[config.xChannelIndex] += 3 * (Math.random() - 0.5) * xStep;
      newChannels[config.yChannelIndex] += 3 * (Math.random() - 0.5) * yStep;
      newChannels[config.zChannelIndex] += 3 * (Math.random() - 0.5) * zStep;
      const newColor = Color.colorFromChannels(newChannels, palette.colorSpace);
      newColor.tags = color.tags;
      return newColor;
    });
    newPalette = { ...newPalette };
  }
  return newPalette;
};
