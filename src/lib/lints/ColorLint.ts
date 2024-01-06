import type { Palette } from "../../stores/color-store";
import { suggestFix } from "../api-calls";
import { colorFromHex } from "../Color";

export type TaskType = "sequential" | "diverging" | "categorical";
type Annotation =
  | { type: "line"; points: { x: number; y: number }[] }
  | { type: "point"; x: number; y: number; color: string };

// example usage
// const checks = [..., new ColorNameDiscriminability(pal), ...];
// const suggestions = checks.filter((check) => !check.passCheck).map((check) => check.suggestFix());

function AIFix(palette: Palette, message: string, engine: string) {
  return suggestFix(palette, message, engine as any).then((x) => {
    if (x.length === 0) {
      throw new Error("No suggestions");
    }
    const colorSpace = palette.colors[0].spaceName;
    return {
      ...palette,
      colors: x[0].colors.map((x) => colorFromHex(x, colorSpace)),
    };
  });
}

export class ColorLint<CheckData, ParamType> {
  name: string;
  taskTypes: TaskType[];
  passes: boolean;
  checkData: CheckData;
  palette: Palette;
  message: string;
  hasParam: boolean = false;
  param?: ParamType;

  constructor(Palette: Palette) {
    this.name = "";
    this.taskTypes = [];
    this.palette = Palette;
    const { passCheck, data } = this._runCheck();
    this.passes = passCheck;
    this.checkData = data as CheckData;
    this.message = this.buildMessage();
  }

  _runCheck(): { passCheck: boolean; data: CheckData } {
    return { passCheck: true, data: {} as CheckData };
  }
  // Fail Message
  buildMessage(): string {
    return "";
  }

  suggestVisualAnnotation(): Annotation[] {
    return [];
  }

  increaseParam() {
    if (!this.hasParam) {
      throw new Error("Cannot increase param on lint without param");
    }
  }

  async suggestFix(engine?: string) {
    return AIFix(this.palette, this.message, engine || "openai");
  }
}
