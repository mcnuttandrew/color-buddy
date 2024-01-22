import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";

export default class MaxColors extends ColorLint<number, number> {
  name = "Max Colors";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  hasParam = true;
  defaultParam = 10;
  group = "aesthetics";
  description: string = `Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.`;
  paramOptions: { type: "number"; min: number; max: number; step: 1 } = {
    type: "number",
    min: 2,
    max: 20,
    step: 1,
  };
  level: "error" | "warning" = "warning";

  _runCheck() {
    const { colors } = this.palette;
    const numColors = colors.length;
    return {
      passCheck: numColors < this.config.val! + 1,
      data: numColors,
    };
  }
  buildMessage(): string {
    return `This palette has too many colors (${this.checkData}) and may be hard to discriminate in some contexts. Maximum: ${this.config.val}.`;
  }
  async suggestFix() {
    const { colors } = this.palette;
    return {
      ...this.palette,
      colors: colors.slice(0, this.config.val! - 1),
    };
  }
}
