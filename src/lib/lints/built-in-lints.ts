import type { CustomLint } from "./CustomLint";

// lints
import AvoidExtremes from "./avoid-extremes";
import BackgroundDifferentiability from "./background-contrast";
import CatOrderSimilarity from "./cat-order-similarity";
import ColorBlindness from "./color-blindness";
import Fair from "./fair";
import MaxColors from "./max-colors";
import MutuallyDistinct from "./mutually-distinct";
import SequentialOrder from "./sequential-order";
import UglyColors from "./ugly-colors";

const BUILT_INS: CustomLint[] = [
  ...ColorBlindness,
  ...Fair,
  AvoidExtremes,
  BackgroundDifferentiability,
  CatOrderSimilarity,
  MaxColors,
  MutuallyDistinct,
  SequentialOrder,
  UglyColors,
];

export default BUILT_INS;
