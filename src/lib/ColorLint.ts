import type { Palette, PalType } from "../types";

export type LintLevel = "error" | "warning";
export interface LintResult {
  name: string;
  passes: boolean;
  message: string;
  level: LintLevel;
  group: string;
  description: string;
  isCustom: false | string;
  taskTypes: PalType[];
  subscribedFix: string;
}

export class ColorLint<CheckData, ParamType> {
  name: string = "";
  taskTypes: PalType[] = [];
  passes: boolean;
  checkData: CheckData;
  palette: Palette;
  message: string = "";
  isCustom: false | string = false;
  group: string = "";
  description: string = "";
  blameMode: "pair" | "single" | "none" = "none";
  level: LintLevel = "error";
  subscribedFix: string = "none";

  constructor(Palette: Palette) {
    this.palette = Palette;
    this.checkData = undefined as CheckData;
    this.passes = false;
  }

  run(options: any = {}) {
    const { passCheck, data } = this._runCheck(options);
    this.passes = passCheck;
    this.checkData = data as CheckData;
    this.message = this.buildMessage();
    return this;
  }

  _runCheck(_options: any): { passCheck: boolean; data: CheckData } {
    return { passCheck: true, data: {} as CheckData };
  }
  // Fail Message
  buildMessage(): string {
    return "";
  }
}
