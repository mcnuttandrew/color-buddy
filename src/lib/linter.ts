import { ColorLint } from "./lints/ColorLint";
import type { Palette } from "../stores/color-store";

import NameDiscrim from "./lints/name-discrim";
import MaxColors from "./lints/max-colors";
import Discrims from "./lints/size-discrim";
import Blinds from "./lints/blind-check";
import ColorSimilarity from "./lints/color-similarity";
import BackgroundDifferentiability from "./lints/background-differentiability";
import UglyColors from "./lints/ugly-colors";
import SequentialOrder from "./lints/sequential-order";
import AvoidExtremes from "./lints/avoid-extremes";

export function runLintChecks(palette: Palette): ColorLint<any, any>[] {
  return [
    new NameDiscrim(palette),
    new MaxColors(palette),
    ...Discrims.map((x) => new x(palette)),
    ...Blinds.map((x) => new x(palette)),
    new ColorSimilarity(palette),
    new BackgroundDifferentiability(palette),
    new UglyColors(palette),
    new SequentialOrder(palette),
    new AvoidExtremes(palette),
  ];
}
