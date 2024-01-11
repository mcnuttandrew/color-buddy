import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
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
      const pass = x.symmetricDeltaE(background) < 15;
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
    const backgroundL = background.toColorIO().to("lab").coords[0];
    const bgCloserToWhite = backgroundL > 50;
    const clamp = (x: number) => Math.max(0, Math.min(100, x));
    const newL = clamp(
      !bgCloserToWhite ? backgroundL * 1.5 : backgroundL * 0.5
    );
    const newColors = colors.map((x, idx) => {
      if (!this.checkData.includes(idx)) {
        return x;
      }
      const color = colors[idx];
      const colorSpace = color.spaceName;
      const newColor = toColorSpace(color, "lab");
      const [_l, a, b] = newColor.toChannels();
      return toColorSpace(newColor.fromChannels([newL, a, b]), colorSpace);
    });
    return { ...this.palette, colors: newColors };
  }
}
