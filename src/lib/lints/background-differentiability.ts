import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import chroma from "chroma-js";
import { Color, toColorSpace } from "../Color";

const hexJoin = (colors: Color[]) => colors.map((x) => x.toHex()).join(", ");

export default class BackgroundDifferentiability extends ColorLint<
  number[],
  false
> {
  name = "All colors differentiable from background";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  _runCheck() {
    const { colors, background } = this.palette;
    const colorsCloseToBackground = colors.reduce((acc, x, idx) => {
      const pass = chroma.deltaE(x.toChroma(), background.toChroma()) < 10;
      return pass ? [...acc, idx] : acc;
    }, [] as number[]);

    const passCheck = colorsCloseToBackground.length === 0;
    return { passCheck, data: colorsCloseToBackground };
  }
  buildMessage(): string {
    const colors = this.palette.colors;
    const str = hexJoin(this.checkData.map((x) => colors[x]));
    return `This palette has some colors (${str}) that are close to the background color`;
  }
  async suggestFix() {
    const { colors, background } = this.palette;
    const backgroundL = background.toChroma().get("lab.l");
    const newColors = colors.map((x, idx) => {
      if (this.checkData.includes(idx)) {
        const color = colors[idx];
        const colorSpace = color.spaceName;
        const newColor = toColorSpace(color, "lab");
        const [l] = newColor.toChannels();
        const dir = Math.min(l, 100) >= Math.min(backgroundL, 100) ? -1 : 1;
        newColor.setChannel("L", Math.min(l + dir * 5, 100));
        const el = toColorSpace(newColor, colorSpace);
        return el;
      }
      return x;
    });
    return { ...this.palette, colors: newColors };
  }
}
