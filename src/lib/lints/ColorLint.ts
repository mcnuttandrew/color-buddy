import type { Palette } from "../../stores/color-store";
import { suggestFix } from "../api-calls";
import { colorFromHex } from "../Color";

export type TaskType = "sequential" | "diverging" | "categorical";

function AIFix(palette: Palette, message: string, engine: string) {
  const colorSpace = palette.colorSpace;
  return suggestFix(palette, message, engine as any).then((x) => {
    if (x.length === 0) {
      throw new Error("No suggestions");
    }
    return {
      ...palette,
      colors: x[0].colors.map((x) => colorFromHex(x, colorSpace)),
    };
  });
}

export class ColorLint<CheckData, ParamType> {
  name: string = "";
  taskTypes: TaskType[] = [];
  passes: boolean;
  checkData: CheckData;
  palette: Palette;
  message: string = "";
  hasParam: boolean = false;
  config: { val?: ParamType } = {};
  defaultParam: ParamType = false as any;
  paramOptions:
    | { type: "number"; min: number; max: number; step: number }
    | { type: "enum"; options: string[] }
    | { type: "none" } = { type: "none" };
  level: "error" | "warning" = "error";

  constructor(Palette: Palette) {
    this.palette = Palette;
    this.checkData = undefined as CheckData;
    this.passes = false;
  }

  copy() {
    const copy = new ColorLint<CheckData, ParamType>(this.palette);
    copy.name = this.name;
    copy.taskTypes = this.taskTypes;
    copy.passes = this.passes;
    copy.checkData = this.checkData;
    copy.message = this.message;
    copy.hasParam = this.hasParam;
    copy.config = this.config;
    copy.defaultParam = this.defaultParam;
    copy.level = this.level;
    return copy;
  }

  run() {
    const { evalConfig } = this.palette;
    this.config = {
      ...evalConfig[this.name],
      val: evalConfig[this.name]?.val || this.defaultParam,
    };

    const { passCheck, data } = this._runCheck();
    this.passes = passCheck;
    this.checkData = data as CheckData;
    this.message = this.buildMessage();
    return this;
  }

  _runCheck(): { passCheck: boolean; data: CheckData } {
    return { passCheck: true, data: {} as CheckData };
  }
  // Fail Message
  buildMessage(): string {
    return "";
  }

  async suggestFix(engine?: string) {
    return AIFix(this.palette, this.message, engine || "openai");
  }
}
