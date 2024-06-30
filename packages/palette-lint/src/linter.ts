import { RunLint } from "./ColorLint";
import type { Palette } from "../../palette/src/types";
import type { LintProgram, LintResult } from "./ColorLint";

// lints
import Affects from "./lints/affects";
import AvoidExtremes from "./lints/avoid-extremes";
import Contrast from "./lints/background-contrast";
import CatOrderSimilarity from "./lints/cat-order-similarity";
import CVDCheck from "./lints/cvd-check";
import ColorTags from "./lints/color-tags";
import DivergingOrder from "./lints/diverging-order";
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

export const PREBUILT_LINTS: LintProgram[] = [
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
  DivergingOrder,
  Gamut,
  MaxColors,
  MutuallyDistinct,
  NameDiscriminability,
  SequentialOrder,
  UglyColors,
];

const prebuiltIdToCustomFunc = PREBUILT_LINTS.reduce(
  (acc, x) => {
    if (!x.customProgram) {
      return acc;
    }
    acc[x.id] = x.customProgram;
    return acc;
  },
  {} as Record<string, LintProgram["customProgram"]>
);

export default function linter(
  palette: Palette,
  lints: LintProgram[],
  options: Parameters<typeof RunLint>[2]
): LintResult[] {
  const ignoreList = palette.evalConfig;
  const globallyIgnoredLints = palette.evalConfig?.globallyIgnoredLints || [];
  return (
    lints
      .filter((x) => !globallyIgnoredLints.includes(x.id))
      // some undefine-s creeping in?
      .filter((x) => !!x.group)
      // task type
      .filter((x) => x.taskTypes.includes(palette.type))
      // tag type
      .filter((x) => {
        if (x.requiredTags.length === 0) return true;
        return x.requiredTags.some((a) => palette.tags.includes(a));
      })
      // ignore list
      .filter((x) => !(ignoreList[x.name] && ignoreList[x.name].ignore))
      .map((x) => {
        if (prebuiltIdToCustomFunc[x.id]) {
          x.customProgram = prebuiltIdToCustomFunc[x.id];
        }
        try {
          return RunLint(x, palette, options);
        } catch (e) {
          console.error(e);
        }
      })
      .filter((x) => !!x)
      .map((x) => {
        if (x && x.lintProgram.customProgram) {
          delete x.lintProgram.customProgram;
        }
        return x;
      }) as LintResult[]
  );
}
