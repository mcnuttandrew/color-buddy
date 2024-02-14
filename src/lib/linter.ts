import { ColorLint } from "./lints/ColorLint";
import type { Palette } from "../stores/color-store";

import NameDiscrim from "./lints/name-discrim";
import Discrims from "./lints/size-discrim";
import ColorSimilarity from "./lints/color-similarity";
import BackgroundDifferentiability from "./lints/background-differentiability";
import SequentialOrder from "./lints/sequential-order";
import DivergingOrder from "./lints/diverging-order";
import BackgroundContrast from "./lints/contrast";
import Fair from "./lints/fair";
import EvenDistribution from "./lints/even-distribution";
import type { CustomLint } from "./lints/CustomLint";
import { CreateCustomLint } from "./lints/CustomLint";

export const manualLints = [
  NameDiscrim,
  ...Discrims,
  ColorSimilarity,
  BackgroundDifferentiability,
  SequentialOrder,
  DivergingOrder,
  BackgroundContrast,
  ...Fair,
  // EvenDistribution,
];

export function runLintChecks(
  palette: Palette,
  customLints: CustomLint[]
  // ignoreList: Record<string, any>
): ColorLint<any, any>[] {
  const ignoreList = palette.evalConfig;
  return (
    [
      ...manualLints,
      ...customLints.map((x) => CreateCustomLint(x)),
    ] as (typeof ColorLint)[]
  )
    .map((x) => new x(palette))
    .filter((x) => x.taskTypes.includes(palette.type))
    .map((x) => {
      if (ignoreList[x.name] && ignoreList[x.name].ignore) {
        return x;
      }
      try {
        return x.run();
      } catch (e) {
        console.error(e);
        return x;
      }
    });
}
