import linter from "./linter";

import type { LintResult, LintProgram } from "./ColorLint";

import { generateMCFix } from "./linter-tools/monte-carlo-fix";

import simulateCVD from "./cvd-sim";

import { suggestLintFix } from "./linter-tools/lint-fixer";

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

const PREBUILT_LINTS: LintProgram[] = [
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

export { PREBUILT_LINTS, generateMCFix, linter, simulateCVD, suggestLintFix };
export type { LintResult, LintProgram };
