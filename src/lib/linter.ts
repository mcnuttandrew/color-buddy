import { ColorLint } from "./ColorLint";
import type { Palette } from "../stores/color-store";
import type { CustomLint } from "./CustomLint";
import { CreateCustomLint } from "./CustomLint";

// manual lints
import DivergingOrder from "./lints/diverging-order";
import EvenDistribution from "./lints/even-distribution";

// custom lints
import AvoidExtremes from "./lints/avoid-extremes";
import BackgroundDifferentiability from "./lints/background-contrast";
import CatOrderSimilarity from "./lints/cat-order-similarity";
import ColorBlindness from "./lints/color-blindness";
import SizeDiscrim from "./lints/size-discrim";
import Fair from "./lints/fair";
import Gamut from "./lints/in-gamut";
import MaxColors from "./lints/max-colors";
import MutuallyDistinct from "./lints/mutually-distinct";
import SequentialOrder from "./lints/sequential-order";
import UglyColors from "./lints/ugly-colors";

export const BUILT_INS: CustomLint[] = [
  ...ColorBlindness,
  ...Fair,
  ...SizeDiscrim,
  AvoidExtremes,
  BackgroundDifferentiability,
  CatOrderSimilarity,
  Gamut,
  MaxColors,
  MutuallyDistinct,
  SequentialOrder,
  UglyColors,
];

export function runLintChecks(
  palette: Palette,
  customLints: CustomLint[]
): ColorLint<any, any>[] {
  const ignoreList = palette.evalConfig;
  const lints = [
    DivergingOrder,
    ...customLints.map((x) => CreateCustomLint(x)),
  ] as (typeof ColorLint)[];
  return lints
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
