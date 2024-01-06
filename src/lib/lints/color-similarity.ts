import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { computeStats } from "../color-stats";

const defaultParamValue = 10;
export default class ColorSimilarity extends ColorLint<number[], number> {
  name = "Colors are differentiable in order";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  hasParam = true;
  param = defaultParamValue;
  _runCheck() {
    const { colors } = this.palette;
    const data = computeStats(
      colors.map((x) => x.toChroma()),
      "dE"
    );
    const failingIndexes =
      data?.dE.reduce((acc, x, idx) => {
        if (x < (this.param || defaultParamValue)) {
          return [...acc, idx];
        }
        return acc;
      }, [] as number[]) || [];
    const passCheck = failingIndexes?.length === 0;
    return { passCheck, data: failingIndexes };
  }
  buildMessage(): string {
    const { colors } = this.palette;
    const pairs = this.checkData
      .map((x) => {
        const a = colors[x].toHex();
        const b = colors[x + 1].toHex();
        return `(${a} ${b})`;
      })
      .join(", ");
    return `Some colors are too similar based on dE scores: ${pairs}`;
  }
  increaseParam(): void {
    this.param = this.param + 5;
  }
}
