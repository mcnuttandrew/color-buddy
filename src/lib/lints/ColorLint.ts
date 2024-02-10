import type { Palette } from "../../stores/color-store";
import { suggestFix } from "../api-calls";
import { Color } from "../Color";

export type TaskType = "sequential" | "diverging" | "categorical";

function AIFix(palette: Palette, message: string, engine: string) {
  const colorSpace = palette.colorSpace;
  return suggestFix(palette, message, engine as any).then((x) => {
    if (x.length === 0) {
      throw new Error("No suggestions");
    }
    return x.map((el) => {
      try {
        return {
          ...palette,
          colors: el.colors.map((x) =>
            Color.colorFromHex(x.replace("##", "#"), colorSpace)
          ),
        };
      } catch (e) {
        console.log(e);
        return palette;
      }
    });
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
  hasHeuristicFix: boolean = false;
  config: { val?: ParamType } = {};
  defaultParam: ParamType = false as any;
  isCustom: false | string = false;
  group: string = "";
  description: string = "";
  blameMode: "pair" | "single" | "none" = "none";
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
    copy.hasHeuristicFix = this.hasHeuristicFix;
    copy.level = this.level;
    copy.group = this.group;
    copy.description = this.description;
    copy.paramOptions = this.paramOptions;
    copy.isCustom = this.isCustom;
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

  async suggestFix(engine?: string): Promise<Palette[]> {
    return AIFix(this.palette, this.message, engine || "openai");
  }
  async suggestAIFix(engine?: string): Promise<Palette[]> {
    return AIFix(this.palette, this.message, engine || "openai");
  }
}
