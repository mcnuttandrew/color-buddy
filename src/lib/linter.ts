import { ColorLint } from "./lints/ColorLint";
import type { Palette } from "../stores/color-store";

import NameDiscrim from "./lints/name-discrim";
import MaxColors from "./lints/max-colors";
import Discrims from "./lints/size-discrim";
import Blinds from "./lints/blind-check";
import ColorSimilarity from "./lints/color-similarity";
import BackgroundDifferentiability from "./lints/background-differentiability";
import UglyColors from "./lints/ugly-colors";
import SequentialOrder from "./lints/sequential-order";
import AvoidExtremes from "./lints/avoid-extremes";
import DivergingOrder from "./lints/diverging-order";
import BackgroundContrast from "./lints/contrast";
import Fair from "./lints/fair";
import EvenDistribution from "./lints/even-distribution";

export function runLintChecks(
  palette: Palette,
  palType: any
): ColorLint<any, any>[] {
  return (
    [
      NameDiscrim,
      MaxColors,
      ...Discrims,
      ...Blinds,
      ColorSimilarity,
      BackgroundDifferentiability,
      UglyColors,
      SequentialOrder,
      AvoidExtremes,
      DivergingOrder,
      BackgroundContrast,
      ...Fair,
      EvenDistribution,
    ] as (typeof ColorLint)[]
  )
    .map((x) => new x(palette))
    .filter((x) => x.taskTypes.includes(palType))
    .map((x) => x.run());
}

// typesript type for an list of classes
// https://stackoverflow.com/questions/57465358/typescript-type-for-an-list-of-classes
