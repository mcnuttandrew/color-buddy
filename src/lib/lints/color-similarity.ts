import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { computeStats } from "../color-stats";

export default class ColorSimilarity extends ColorLint<number[], number> {
  name = "Colors are differentiable in order (dE units)";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  hasParam = true;
  defaultParam: number = 10;
  group: string = "usability";
  description: string = `Opt for colors that are perceptually distinguishable in a logical sequence when designing visual elements like charts or graphs. This ensures that viewers can easily recognize the order or progression of data points. For categorical this means that when only a small number of colors are used, they should be as different as possible. For sequential and diverging, this means that the colors should be as different as possible in order.`;
  paramOptions: { type: "number"; min: number; max: number; step: number } = {
    type: "number",
    min: 10,
    max: 100,
    step: 1,
  };
  _runCheck() {
    const { colors } = this.palette;
    const data = computeStats(colors, "dE");
    const failingIndexes =
      data?.dE.reduce((acc, x, idx) => {
        if (x < this.config.val!) {
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
}
