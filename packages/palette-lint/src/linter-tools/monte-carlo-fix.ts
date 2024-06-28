import type { Palette } from "@color-buddy/palette";

import { Color, ColorSpaceDirectory } from "@color-buddy/palette";
import { wrapColor } from "@color-buddy/palette";
import type { CustomLint } from "../ColorLint";
import { CreateCustomLint } from "../ColorLint";

export const generateMCFix = (
  palette: Palette,
  lints: CustomLint[]
): Palette => {
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
    const newLints = lints.map(
      (lint) => new (CreateCustomLint(lint))(newPalette)
    );
    newLints.forEach((lint) => lint.run());
    if (newLints.every((lint) => lint.passes)) {
      passing = true;
      break;
    }
    // generate blame for the new lints
    const blamedWithDuplicates = newLints.flatMap((lint) =>
      lint.getBlamedColors()
    );
    const blamed = [...new Set(blamedWithDuplicates)];
    newPalette.colors = [...newPalette.colors].map((color) => {
      // do nothing if the color is not blamed
      if (!blamed.includes(color.color.toString())) {
        return color;
      }
      // take random steps for each of the blamed colors
      const channels = color.color.toChannels();
      const newChannels = [...channels] as [number, number, number];
      newChannels[config.xChannelIndex] += 3 * (Math.random() - 0.5) * xStep;
      newChannels[config.yChannelIndex] += 3 * (Math.random() - 0.5) * yStep;
      newChannels[config.zChannelIndex] += 3 * (Math.random() - 0.5) * zStep;
      const newColor = Color.colorFromChannels(newChannels, palette.colorSpace);

      return wrapColor(newColor);
    });
    newPalette = { ...newPalette };
  }
  return newPalette;
};

//   // console.log("second stage");
//   // let upper = newPalette;
//   // let lower = palette;
//   // let mid = interpolatePalettes(upper, lower);
//   // let sufficient = false;
//   // let minChecks = 5;
//   // let maxChecks = 10;
//   // let checks = 0;
//   // while (!sufficient && checks < maxChecks) {
//   //   checks++;
//   //   const midLints = lints.map((lint) => new (CreateCustomLint(lint))(mid));
//   //   midLints.forEach((lint) => lint.run());
//   //   if (midLints.every((lint) => lint.passes)) {
//   //     sufficient = checks > minChecks;
//   //     break;
//   //   }
//   //   if (midLints.some((lint) => lint.passes)) {
//   //     upper = mid;
//   //   } else {
//   //     lower = mid;
//   //   }
//   //   mid = interpolatePalettes(upper, lower);
//   // }
//   // console.log("finished");
//   // return mid;
// };

// function interpolatePalettes(palA: Palette, palB: Palette) {
//   const newColors = palA.colors.map((colorA, i) => {
//     const colorB = palB.colors[i];
//     const newChannels = colorA.color.toChannels().map((channelA, j) => {
//       const channelB = colorB.color.toChannels()[j];
//       return (channelA + channelB) / 2;
//     }) as [number, number, number];
//     const newColor = Color.colorFromChannels(newChannels, palA.colorSpace);
//     return wrapColor(newColor);
//   });
//   return {
//     ...palA,
//     colors: newColors,
//   };
// }
