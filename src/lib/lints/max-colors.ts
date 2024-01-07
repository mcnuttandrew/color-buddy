import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";

const defaultMaxColors = 10;
export default class MaxColors extends ColorLint<number, number> {
  name = "Max Colors";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  hasParam = true;
  param = defaultMaxColors;
  level: "error" | "warning" = "warning";

  _runCheck() {
    const { colors } = this.palette;
    const numColors = colors.length;
    return {
      passCheck: numColors < (this.param || defaultMaxColors) + 1,
      data: numColors,
    };
  }
  buildMessage(): string {
    return `This palette has too many colors (${this.checkData}) and may be hard to discriminate in some contexts`;
  }
  async suggestFix() {
    const { colors } = this.palette;
    return { ...this.palette, colors: colors.slice(0, this.param - 1) };
  }
  increaseParam(): void {
    this.param = this.param + 1;
  }
}
