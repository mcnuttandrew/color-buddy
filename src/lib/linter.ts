import { ColorLint } from "./lints/ColorLint";
import type { Palette } from "../stores/color-store";

import Discrims from "./lints/size-discrim";
import DivergingOrder from "./lints/diverging-order";
import EvenDistribution from "./lints/even-distribution";
import type { CustomLint } from "./lints/CustomLint";
import { CreateCustomLint } from "./lints/CustomLint";

export const manualLints = [...Discrims, DivergingOrder];

export function runLintChecks(
  palette: Palette,
  customLints: CustomLint[]
  // ignoreList: Record<string, any>
): ColorLint<any, any>[] {
  const ignoreList = palette.evalConfig;
  return (
    [
      ...manualLints,
      ...customLints.map((x) => CreateCustomLint(x)),
    ] as (typeof ColorLint)[]
  )
    .map((x) => new x(palette))
    .filter((x) => x.taskTypes.includes(palette.type))
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
    });
}
