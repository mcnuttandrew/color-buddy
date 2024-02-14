import type { Palette } from "../../stores/color-store";
// import { suggestFix } from "../api-calls";
// import { Color } from "../Color";

export type TaskType = "sequential" | "diverging" | "categorical";
export type LintLevel = "error" | "warning";
export interface LintResult {
  name: string;
  passes: boolean;
  message: string;
  level: LintLevel;
  group: string;
  description: string;
  isCustom: false | string;
  taskTypes: TaskType[];
  hasHeuristicFix: boolean;
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
  level: LintLevel = "error";

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
  static suggestFix(palette: Palette): Promise<Palette[]> {
    return Promise.resolve([]);
  }
}
