import { ColorLint } from "./ColorLint";
import type { Palette } from "../types";
import type { CustomLint } from "./CustomLint";
import { CreateCustomLint } from "./CustomLint";

// manual lints
import DivergingOrder from "./lints/diverging-order";

// custom lints
import Affects from "./lints/affects";
import AvoidExtremes from "./lints/avoid-extremes";
import BackgroundDifferentiability from "./lints/background-contrast";
import CatOrderSimilarity from "./lints/cat-order-similarity";
import CVDCheck from "./lints/cvd-check";
import ColorTags from "./lints/color-tags";
import EvenDistribution from "./lints/even-distribution";
import Fair from "./lints/fair";
import Gamut from "./lints/in-gamut";
import MaxColors from "./lints/max-colors";
import MutuallyDistinct from "./lints/mutually-distinct";
import MuthGuidelines from "./lints/muth-guidelines";
import NameDiscriminability from "./lints/name-discrim";
import SequentialOrder from "./lints/sequential-order";
import SizeDiscrim from "./lints/size-discrim";
import UglyColors from "./lints/ugly-colors";

export const BUILT_INS: CustomLint[] = [
  ...Affects,
  ...CVDCheck,
  ...ColorTags,
  ...Fair,
  ...MuthGuidelines,
  ...SizeDiscrim,
  AvoidExtremes,
  BackgroundDifferentiability,
  CatOrderSimilarity,
  EvenDistribution,
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
  const globallyIgnoredLints = palette.evalConfig?.globallyIgnoredLints || [];
  const lints = [
    DivergingOrder,
    ...customLints.map((x) => CreateCustomLint(x)),
  ] as (typeof ColorLint)[];
  return (
    lints
      .map((x) => new x(palette))
      .filter((x) => !globallyIgnoredLints.includes(x.isCustom))
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
