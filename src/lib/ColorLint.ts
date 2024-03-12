import type { Palette, PalType, Affect, Context } from "../types";

export type LintLevel = "error" | "warning";
export interface LintResult {
  affectTypes: Affect[];
  contextTypes: Context[];
  description: string;
  group: string;
  isCustom: false | string;
  level: LintLevel;
  message: string;
  name: string;
  naturalLanguageProgram: string;
  passes: boolean;
  subscribedFix: string;
  taskTypes: PalType[];
}

export class ColorLint<CheckData, ParamType> {
  name: string = "";
  taskTypes: PalType[] = [];
  affectTypes: Affect[] = [];
  contextTypes: Context[] = [];
  passes: boolean;
  checkData: CheckData;
  palette: Palette;
  message: string = "";
  isCustom: false | string = false;
  group: string = "";
  description: string = "";
  blameMode: "pair" | "single" | "none" = "none";
  naturalLanguageProgram: string = "";
  level: LintLevel = "error";
  subscribedFix: string = "none";
  program: string = "";

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
