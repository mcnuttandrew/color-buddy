import { ColorLint } from "./ColorLint";
import type { Palette } from "../types";
import type { CustomLint } from "./CustomLint";
import { CreateCustomLint } from "./CustomLint";

// manual lints
import DivergingOrder from "./lints/diverging-order";
import EvenDistribution from "./lints/even-distribution";

// custom lints
import Affects from "./lints/affects";
import AvoidExtremes from "./lints/avoid-extremes";
import BackgroundDifferentiability from "./lints/background-contrast";
import CatOrderSimilarity from "./lints/cat-order-similarity";
import ColorBlindness from "./lints/color-blindness";
import Fair from "./lints/fair";
import Gamut from "./lints/in-gamut";
import MaxColors from "./lints/max-colors";
import MutuallyDistinct from "./lints/mutually-distinct";
import NameDiscriminability from "./lints/name-discrim";
import SequentialOrder from "./lints/sequential-order";
import SizeDiscrim from "./lints/size-discrim";
import UglyColors from "./lints/ugly-colors";

export const BUILT_INS: CustomLint[] = [
  ...Affects,
  ...ColorBlindness,
  ...Fair,
  ...SizeDiscrim,
  AvoidExtremes,
  BackgroundDifferentiability,
  CatOrderSimilarity,
  Gamut,
  MaxColors,
  MutuallyDistinct,
  NameDiscriminability,
  SequentialOrder,
  UglyColors,
];

export function runLintChecks(
  palette: Palette,
  customLints: CustomLint[]
): ColorLint<any, any>[] {
  const ignoreList = palette.evalConfig;
  const affects = palette.intendedAffects;
  const contexts = palette.intendedContexts;
  const lints = [
    DivergingOrder,
    ...customLints.map((x) => CreateCustomLint(x)),
  ] as (typeof ColorLint)[];
  return (
    lints
      .map((x) => new x(palette))
      // task type
      .filter((x) => x.taskTypes.includes(palette.type))
      // affect type
      .filter((x) => {
        if (x.affectTypes.length === 0) return true;
        return x.affectTypes.some((a) => affects.includes(a));
      })
      // context type
      .filter((x) => {
        if (x.contextTypes.length === 0) return true;
        return x.contextTypes.some((a) => contexts.includes(a));
      })
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
      })
  );
}
