import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";

// magic numbers supplied by the paper
const cRangeUnfair = 80;
const lRangeUnfair = 50;

const lRangePredicate = {
  "<": {
    left: { extent: { sort: "colors", varb: "x", func: { "lch.l": "x" } } },
    right: lRangeUnfair,
  },
};
const cRangePredicate = {
  "<": {
    left: { extent: { sort: "colors", varb: "x", func: { "lch.c": "x" } } },
    right: cRangeUnfair,
  },
};
const failMsgBase = `This palette is unfair (meaning that some values may unduely stand out). Note that this check is naturally at odds with color blind friendly palettes.`;
// json program version
const FairNominal: CustomLint = {
  name: "Fair",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    and: [lRangePredicate, cRangePredicate],
  }),
  taskTypes: ["categorical"] as const,
  level: "warning",
  group: "design",
  description:
    "Do the colors stand out equally? A color palette is described as fair if both chroma and luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold.",
  failMessage: `${failMsgBase} Maximum chroma range: ${cRangeUnfair}, maximum luminance range: ${lRangeUnfair}.`,
  id: "fair-nominal-built-in",
  blameMode: "single",
};
const FairSequential: CustomLint = {
  ...FairNominal,
  taskTypes: ["sequential", "diverging"] as const,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    and: [lRangePredicate],
  }),
  failMessage: `${failMsgBase} Maximum chroma range: ${lRangeUnfair}.`,
  id: "fair-sequential-built-in",
  description:
    "Do the colors stand out equally? A color palette is described as fair if the luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold. ",
};
export default [FairNominal, FairSequential];
