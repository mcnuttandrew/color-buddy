import { Color } from "../Color";
import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { extent } from "../utils";

// magic numbers supplied by the paper
const cRangeUnfair = 80;
const lRangeUnfair = 50;

const identifyUnfair = (
  colors: Color[],
  threshold: number,
  channel: number
) => {
  const channelRange = extent(colors.map((x) => x.toChannels()[channel]));
  const outOfBoundColors = colors.filter(
    (x) => x.toChannels()[channel] > channelRange[0] + threshold
  );
  return outOfBoundColors;
};

const fairMessage = (outOfBandL: Color[], outOfBandC: Color[]) => {
  const lPass = outOfBandL.length === 0;
  const cPass = outOfBandC.length === 0;
  if (lPass && cPass) {
    return "";
  }
  const baseMessage = `This palette is unfair (meaning that some values may unduely stand out).`;
  const lMsg = lPass
    ? ""
    : `The following colors have a luminance value that is out of range: ${outOfBandL
        .map((x) => x.toHex())
        .join(", ")}.`;
  const cMsg = cPass
    ? ""
    : `The following colors have a chroma value that is out of range: ${outOfBandC
        .map((x) => x.toHex())
        .join(", ")}.`;
  return `${baseMessage} ${lMsg} ${cMsg}`;
};

class FairBase extends ColorLint<any, number> {
  name = "Fair";
  group = "aesthetics";
  //   hasParam = true;
  level: "error" | "warning" = "warning";
  //   defaultParam = 1;
  //   paramOptions: { type: "number"; min: number; max: number; step: 1 } = {
  //     type: "number",
  //     min: 2,
  //     max: 20,
  //     step: 1,
  //   };

  description: string = `Do the colors stand out equally? A color palette is described as fair if both chroma and luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold. For sequential and diverging palettes, only the chroma range is considered.`;
  buildMessage(): string {
    const { outOfBandL, outOfBandC } = this.checkData;
    return fairMessage(outOfBandL, outOfBandC);
  }
}

class FairSequential extends FairBase {
  taskTypes = ["sequential", "diverging"] as TaskType[];

  _runCheck() {
    const { colors } = this.palette;
    const outOfBandL = identifyUnfair(colors, lRangeUnfair, 0);
    return {
      passCheck: outOfBandL.length === 0,
      data: { outOfBandL, outOfBandC: [] },
    };
  }
}

class FairNominal extends FairBase {
  taskTypes = ["categorical"] as TaskType[];

  _runCheck() {
    const { colors } = this.palette;
    const outOfBandL = identifyUnfair(colors, lRangeUnfair, 0);
    const outOfBandC = identifyUnfair(colors, cRangeUnfair, 1);
    return {
      passCheck: !outOfBandL.length && !outOfBandC.length,
      data: { outOfBandL, outOfBandC },
    };
  }
}

const Fair = [FairSequential, FairNominal];
export default Fair;
