import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { Color } from "../Color";

const hexJoin = (colors: Color[]) => colors.map((x) => x.toHex()).join(", ");

const uggos = ["#56FF00", "#0010FF", "#6A7E25", "#FF00EF", "#806E28"];
const uglyColors = uggos.map((x) => Color.colorFromString(x, "lab"));
const checkIfAColorIsCloseToAnUglyColor = (colors: Color[]) =>
  colors.filter((color) =>
    uglyColors.some((x) => x.symmetricDeltaE(color) < 10)
  );

export default class UglyColors extends ColorLint<Color[], false> {
  name = "Palette does not have ugly colors";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  level: "error" | "warning" = "warning";
  group = "aesthetics";
  description: string = `Colors that are close to what are known as ugly colors are sometimes advised against. See https://www.colourlovers.com/palette/1416250/The_Ugliest_Colors for more details.`;
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
    const colors = [...this.palette.colors];

    const uggColors = new Set(
      checkIfAColorIsCloseToAnUglyColor(colors).map((x) => x.toHex())
    );
    const newColors = colors.filter((x) => !uggColors.has(x.toHex()));
    return { ...this.palette, colors: newColors };
  }
}
