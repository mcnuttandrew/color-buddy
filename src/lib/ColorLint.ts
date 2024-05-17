import type { Palette } from "../types";

import {
  LLEval,
  prettyPrintLL,
  permutativeBlame,
} from "./lint-language/lint-language";
import * as Json from "jsonc-parser";

export interface LintResult {
  description: string;
  group: string;
  isCustom: false | string;
  level: CustomLint["level"];
  message: string;
  name: string;
  naturalLanguageProgram: string;
  passes: boolean;
  subscribedFix: string;
  taskTypes: Palette["type"][];
  requiredTags: string[];
  id: string | undefined;
}

export class ColorLint<CheckData, ParamType> {
  name: string = "";
  taskTypes: Palette["type"][] = [];
  requiredTags: string[] = [];
  passes: boolean;
  checkData: CheckData;
  palette: Palette;
  message: string = "";
  isCustom: false | string = false;
  group: CustomLint["group"] = "design";
  description: string = "";
  blameMode: CustomLint["blameMode"] = "none";
  naturalLanguageProgram: string = "";
  level: CustomLint["level"] = "error";
  subscribedFix: string = "none";
  program: string = "";
  id: string | undefined = undefined;

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

export interface CustomLint {
  blameMode: "pair" | "single" | "none";
  description: string;
  failMessage: string;
  group: "design" | "accessibility" | "usability" | "custom";
  id: string;
  level: "error" | "warning";
  name: string;
  program: string;
  subscribedFix?: string;
  taskTypes: Palette["type"][];
  requiredTags: string[];
  expectedPassingTests: Palette[];
  expectedFailingTests: Palette[];
}

export function CreateCustomLint(props: CustomLint) {
  let natProg = "";
  try {
    natProg = prettyPrintLL(Json.parse(props.program));
  } catch (e) {}
  return class CustomLint extends ColorLint<number[] | number[][], any> {
    blameMode = props.blameMode;
    description = props.description;
    group = props.group;
    isCustom = props.id;
    level = props.level;
    name = props.name;
    naturalLanguageProgram = natProg;
    program = props.program;
    requiredTags = props.requiredTags;
    subscribedFix = props.subscribedFix || "none";
    taskTypes = props.taskTypes;
    id = props.id;

    _runCheck(options: any) {
      const prog = Json.parse(props.program);
      const { blame, result } = LLEval(prog, this.palette, {
        debugCompare: false,
        ...options,
      });
      if (result) return { passCheck: true, data: blame };
      let newBlame: number[] | number[][] = [];
      if (this.blameMode !== "none") {
        newBlame = permutativeBlame(prog, this.palette, this.blameMode);
      }

      return { passCheck: result, data: newBlame };
    }

    getBlamedColors(): string[] {
      if (this.blameMode === "pair") {
        return (this.checkData as number[][]).flatMap((x) =>
          x.map((x) => this.palette.colors[x].color.toHex())
        );
      } else {
        return (this.checkData as number[]).map((x) =>
          this.palette.colors[x].color.toHex()
        );
      }
    }

    buildMessage() {
      let blame = "";
      if (this.blameMode === "pair") {
        blame = (this.checkData as number[][])
          .map((x) =>
            x.map((x) => this.palette.colors[x].color.toHex()).join(" and ")
          )
          .join(", ");
      } else {
        blame = (this.checkData as number[])
          .map((x) => this.palette.colors[x].color.toHex())
          .join(", ");
      }

      return props.failMessage.replaceAll("{{blame}}", blame);
    }
  };
}
