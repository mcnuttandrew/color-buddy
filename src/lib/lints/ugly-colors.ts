import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { Color } from "../Color";

const hexJoin = (colors: Color[]) => colors.map((x) => x.toHex()).join(", ");

const uggos = ["#56FF00", "#0010FF", "#6A7E25", "#FF00EF", "#806E28"];
const uglyColors = uggos.map((x) => Color.colorFromString(x, "lab"));
const uggoSet = new Set(uggos);
function checkIfAColorIsCloseToAnUglyColor(colors: Color[]) {
  return colors.filter((color) => {
    const deltas = uglyColors.map((uglyColor) =>
      uglyColor.symmetricDeltaE(color)
    );
    return deltas.some((x) => x < 10);
  });
}

export default class UglyColors extends ColorLint<Color[], false> {
  name = "Palette does not have ugly colors";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  level: "error" | "warning" = "warning";
  _runCheck() {
    const { colors } = this.palette;
    const data = checkIfAColorIsCloseToAnUglyColor(colors);
    const passCheck = data.length === 0;
    return { passCheck, data };
  }
  buildMessage(): string {
    const str = hexJoin(this.checkData);
    return `This palette has some colors (specifically ${str}) that are close to what are known as ugly colors`;
  }
  async suggestFix() {
    return {
      ...this.palette,
      colors: this.palette.colors.filter((x) => !uggoSet.has(x.toHex())),
    };
  }
}
