import type { Palette } from "../../types";

import { Color, colorPickerConfig } from "../Color";
import { wrapInBlankSemantics } from "../utils";
import type { CustomLint } from "../ColorLint";
import { CreateCustomLint } from "../ColorLint";

export const doMonteCarloFix = (
  palette: Palette,
  lint: CustomLint
): Palette => {
  // identify the step sizes for this color space
  const config = colorPickerConfig[palette.colorSpace];
  const xStep = config.xStep;
  const yStep = config.yStep;
  const zStep = config.zStep;

  let newPalette = palette;
  let passing = false;
  let stepCount = 0;
  while (!passing) {
    stepCount++;
    if (stepCount > 1000) {
      break;
    }
    // run lint on new palette
    const newLint = new (CreateCustomLint(lint))(newPalette);
    newLint.run();
    if (newLint.passes) {
      passing = true;
      break;
    }
    // generate blame for this lint
    const blamed = newLint.getBlamedColors();
    newPalette.colors = [...newPalette.colors].map((color, i) => {
      // do nothing if the color is not blamed
      if (!blamed.includes(color.color.toHex())) {
        return color;
      }
      // take random steps for each of the blamed colors
      const channels = color.color.toChannels();
      const newChannels = [...channels] as [number, number, number];
      newChannels[config.xChannelIndex] += 3 * (Math.random() - 0.5) * xStep;
      newChannels[config.yChannelIndex] += 3 * (Math.random() - 0.5) * yStep;
      newChannels[config.zChannelIndex] += 3 * (Math.random() - 0.5) * zStep;
      const newColor = Color.colorFromChannels(newChannels, palette.colorSpace);

      // console.log(newColor.toHex());
      return wrapInBlankSemantics(newColor);
    });
    newPalette = { ...newPalette };
  }
  return newPalette;
};
