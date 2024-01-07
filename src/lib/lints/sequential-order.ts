import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import chroma from "chroma-js";
import ColorIO from "colorjs.io";
import { Color } from "../Color";

const getLightness = (color: Color) =>
  new ColorIO(color.toHex()).to("lab").coords[0];
export default class SequentialOrder extends ColorLint<boolean, false> {
  name = "Sequential Palettes should be ordered by lightness";
  taskTypes = ["sequential"] as TaskType[];
  _runCheck() {
    const { colors } = this.palette;
    if (colors.length < 2) {
      return { passCheck: true, data: false };
    }
    let direction = getLightness(colors[0]) < getLightness(colors[1]) ? 1 : -1;
    for (let i = 1; i < colors.length; i++) {
      if (
        direction * (getLightness(colors[i - 1]) - getLightness(colors[i])) >
        0
      ) {
        return { passCheck: false, data: false };
      }
    }
    return { passCheck: true, data: false };
  }
  buildMessage(): string {
    return `This pal should be ordered by lightness if being used as a sequential palette`;
  }
  async suggestFix() {
    const colors = [...this.palette.colors];
    colors.sort((a, b) => getLightness(a) - getLightness(b));
    return { ...this.palette, colors };
  }
}
