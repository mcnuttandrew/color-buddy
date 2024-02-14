// import { Color } from "../Color";
// import { ColorLint } from "./ColorLint";
// import type { TaskType } from "./ColorLint";
// import { extent } from "../utils";
import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";

// magic numbers supplied by the paper
const cRangeUnfair = 80;
const lRangeUnfair = 50;

// const identifyUnfair = (
//   colors: Color[],
//   threshold: number,
//   channel: number
// ) => {
//   const channelRange = extent(colors.map((x) => x.toChannels()[channel]));
//   const outOfBoundColors = colors.filter(
//     (x) => x.toChannels()[channel] > channelRange[0] + threshold
//   );
//   return outOfBoundColors;
// };

// const fairMessage = (outOfBandL: Color[], outOfBandC: Color[]) => {
//   const lPass = outOfBandL.length === 0;
//   const cPass = outOfBandC.length === 0;
//   if (lPass && cPass) {
//     return "";
//   }
//   const baseMessage = `This palette is unfair (meaning that some values may unduely stand out).`;
//   const lMsg = lPass
//     ? ""
//     : `The following colors have a luminance value that is out of range: ${outOfBandL
//         .map((x) => x.toHex())
//         .join(", ")}.`;
//   const cMsg = cPass
//     ? ""
//     : `The following colors have a chroma value that is out of range: ${outOfBandC
//         .map((x) => x.toHex())
//         .join(", ")}.`;
//   return `${baseMessage} ${lMsg} ${cMsg}`;
// };

// class FairBase extends ColorLint<any, number> {
//   name = "Fair";
//   group = "design";
//   //   hasParam = true;
//   level: "error" | "warning" = "warning";

//   description: string = `Do the colors stand out equally? A color palette is described as fair if both chroma and luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold. For sequential and diverging palettes, only the chroma range is considered.`;
//   buildMessage(): string {
//     const { outOfBandL, outOfBandC } = this.checkData;
//     return fairMessage(outOfBandL, outOfBandC);
//   }
// }

// class FairSequential extends FairBase {
//   taskTypes = ["sequential", "diverging"] as TaskType[];

//   _runCheck() {
//     const { colors } = this.palette;
//     const outOfBandL = identifyUnfair(colors, lRangeUnfair, 0);
//     return {
//       passCheck: outOfBandL.length === 0,
//       data: { outOfBandL, outOfBandC: [] },
//     };
//   }
// }

// class FairNominal extends FairBase {
//   taskTypes = ["categorical"] as TaskType[];

//   _runCheck() {
//     const { colors } = this.palette;
//     const outOfBandL = identifyUnfair(colors, lRangeUnfair, 0);
//     const outOfBandC = identifyUnfair(colors, cRangeUnfair, 1);
//     return {
//       passCheck: !outOfBandL.length && !outOfBandC.length,
//       data: { outOfBandL, outOfBandC },
//     };
//   }
// }

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
  subscribedFix: "fixMaxColors",
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
