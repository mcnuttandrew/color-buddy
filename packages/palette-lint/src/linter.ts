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

function processLint(
  palette: Palette,
  lint: LintProgram,
  options: Parameters<typeof RunLint>[2]
): LintResult {
  // invalid
  const globallyIgnoredLints = palette.evalConfig?.globallyIgnoredLints || [];
  const globalIgnore = globallyIgnoredLints.includes(lint.id);
  // some undefine-s creeping in?
  const groupIsUndefined = !lint.group;
  // task type
  const wrongTaskType = !lint.taskTypes.includes(palette.type);
  // tag type
  const wrongTagType =
    lint.requiredTags.length > 0 &&
    !lint.requiredTags.some((a) => palette.tags.includes(a));
  if (globalIgnore || groupIsUndefined || wrongTaskType || wrongTagType) {
    return { kind: "invalid", lintProgram: lint };
  }
  // local ignore
  const ignoreList = palette.evalConfig;
  const ignored = !(ignoreList[lint.name] && ignoreList[lint.name].ignore);
  if (!ignored) {
    return { kind: "ignored", lintProgram: lint };
  }

  // run the lint
  if (prebuiltIdToCustomFunc[lint.id]) {
    lint.customProgram = prebuiltIdToCustomFunc[lint.id];
  }
  let result: LintResult;
  try {
    result = RunLint(lint, palette, options);
  } catch (e) {
    console.error(e);
    result = { kind: "invalid", lintProgram: lint };
  }
  if (result.kind === "success" && result?.lintProgram.customProgram) {
    delete result.lintProgram.customProgram;
  }
  return result;
}

/**
 * The primary function for this package, it takes in a palette (defined by color-buddy-palette) and an array of lint programs and returns a list of LintResults.
 */
export default function linter(
  palette: Palette,
  lints: LintProgram[],
  options: Parameters<typeof RunLint>[2]
): LintResult[] {
  return lints.map((lint) => processLint(palette, lint, options));
}
