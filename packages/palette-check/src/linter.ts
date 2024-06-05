import { ColorLint } from "./ColorLint";
import type { Palette } from "./types";
import type { CustomLint } from "./ColorLint";
import { CreateCustomLint } from "./ColorLint";

// manual lints
import DivergingOrder from "./lints/diverging-order";

// custom lints
import Affects from "./lints/affects";
import AvoidExtremes from "./lints/avoid-extremes";
import Contrast from "./lints/background-contrast";
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

export const PREBUILT_LINTS: CustomLint[] = [
  ...Contrast,
  ...Affects,
  ...CVDCheck,
  ...ColorTags,
  ...EvenDistribution,
  ...Fair,
  ...MuthGuidelines,
  ...SizeDiscrim,
  AvoidExtremes,
  CatOrderSimilarity,
  Gamut,
  MaxColors,
  MutuallyDistinct,
  NameDiscriminability,
  SequentialOrder,
  UglyColors,
];

export function linter(
  palette: Palette,
  customLints: CustomLint[]
): ColorLint<any, any>[] {
  const ignoreList = palette.evalConfig;
  const globallyIgnoredLints = palette.evalConfig?.globallyIgnoredLints || [];
  const lints = [
    DivergingOrder,
    ...customLints.map((x) => CreateCustomLint(x)),
  ] as (typeof ColorLint)[];
  return (
    lints
      .map((x) => new x(palette))
      .filter((x) => !globallyIgnoredLints.includes(x.isCustom))
      // some undefine-s creeping in?
      .filter((x) => !!x.group)
      // task type
      .filter((x) => x.taskTypes.includes(palette.type))
      // tag type
      .filter((x) => {
        if (x.requiredTags.length === 0) return true;
        return x.requiredTags.some((a) => palette.tags.includes(a));
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
