import type { Palette } from "../../stores/color-store";

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
  hasHeuristicFix: boolean = false;
  config: { val?: ParamType } = {};
  isCustom: false | string = false;
  group: string = "";
  description: string = "";
  blameMode: "pair" | "single" | "none" = "none";
  level: LintLevel = "error";

  constructor(Palette: Palette) {
    this.palette = Palette;
    this.checkData = undefined as CheckData;
    this.passes = false;
  }

  run() {
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
