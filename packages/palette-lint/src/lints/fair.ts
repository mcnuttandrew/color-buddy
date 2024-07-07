import { JSONToPrettyString } from "../utils";
import { makePalFromString } from "@color-buddy/palette";
import type { LintProgram } from "../ColorLint";
import { schema } from "../constants";

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
const failMsgBase = `This palette is unfair (meaning that some values may unduely stand out). Note that this check is naturally at odds with color vision deficiency friendly palettes.`;
// json program version
const FairNominal: LintProgram = {
  name: "Fair",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    and: [lRangePredicate, cRangePredicate],
  }),
  taskTypes: ["categorical"] as const,
  level: "warning",
  group: "design",
  description:
    "Do the colors stand out equally? A color palette is described as fair if both chroma and luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold.",
  failMessage: `${failMsgBase} Maximum chroma range: ${cRangeUnfair}, maximum luminance range: ${lRangeUnfair}.`,
  id: "fair-nominal-built-in",
  requiredTags: [],
  blameMode: "single",
  expectedPassingTests: [makePalFromString(["#000000"])],
  expectedFailingTests: [makePalFromString(["#debdb5", "#2a2a2a", "#76fc00"])],
};
const FairSequential: LintProgram = {
  ...FairNominal,
  taskTypes: ["sequential", "diverging"] as const,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    ...lRangePredicate,
  }),
  failMessage: `${failMsgBase} Maximum chroma range: ${lRangeUnfair}.`,
  id: "fair-sequential-built-in",
  requiredTags: [],
  description:
    "Do the colors stand out equally? A color palette is described as fair if the luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold. ",
  expectedPassingTests: [makePalFromString(["#000000"])],
  expectedFailingTests: [makePalFromString(["#debdb5", "#2a2a2a", "#76fc00"])],
};
export default [FairNominal, FairSequential] as LintProgram[];
