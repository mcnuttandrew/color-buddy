import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { Color } from "../Color";

const hexJoin = (colors: Color[]) => colors.map((x) => x.toHex()).join(", ");
const bannedColors = ["#000000", "#ffffff", "#000", "#fff"];
const bannedSet = new Set(bannedColors);
// https://www.sciencedirect.com/science/article/pii/S0167947308005549?casa_token=s8jmZqboaYgAAAAA:7lsAu7YUHVBTQA_eaKJ_3FFGv309684j_NTisGO9mIr3UZNIJ6hlAlxPQo04xzsowG7-dH0vzm4
function findExtremeColors(colors: Color[]) {
  return colors.filter((color) => bannedSet.has(color.toHex()));
}

export default class ExtremeColors extends ColorLint<Color[], false> {
  name = "Avoid extreme colors";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  level: "error" | "warning" = "warning";
  group = "aesthetics";
  description = `Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against.`;
  hasHeuristicFix = true;

  _runCheck() {
    const { colors } = this.palette;
    const extremes = findExtremeColors(colors);
    const passCheck = extremes.length === 0;
    return { passCheck, data: extremes };
  }
  buildMessage(): string {
    const str = hexJoin(this.checkData);
    return `Colors at either end of the lightness spectrum (${str}) are hard to discriminate in some contexts, and are sometimes advised against`;
  }
  async suggestFix() {
    return [
      {
        ...this.palette,
        colors: this.palette.colors.filter((x) => !bannedSet.has(x.toHex())),
      },
    ];
  }
}
