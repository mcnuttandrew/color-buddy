import { ColorLint } from "./ColorLint";
import type { PalType, Affect, Context } from "../types";
import {
  LLEval,
  prettyPrintLL,
  permutativeBlame,
} from "./lint-language/lint-language";

import * as Json from "jsonc-parser";
export interface CustomLint {
  affectTypes?: Affect[];
  contextTypes?: Context[];
  blameMode: "pair" | "single" | "none";
  description: string;
  failMessage: string;
  group: string;
  id: string;
  level: "error" | "warning";
  name: string;
  program: string;
  subscribedFix?: string;
  taskTypes: PalType[];
}

export function CreateCustomLint(props: CustomLint) {
  return class CustomLint extends ColorLint<number[] | number[][], any> {
    name = props.name;
    taskTypes = props.taskTypes;
    affectTypes = props.affectTypes || [];
    contextTypes = props.contextTypes || [];
    level = props.level;
    group = props.group;
    description = props.description;
    isCustom = props.id;
    blameMode = props.blameMode;
    subscribedFix = props.subscribedFix || "none";
    naturalLanguageProgram = prettyPrintLL(Json.parse(props.program));

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

    buildMessage() {
      let blame = "";
      if (this.blameMode === "pair") {
        blame = (this.checkData as number[][])
          .map((x) =>
            x.map((x) => this.palette.colors[x].toHex()).join(" and ")
          )
          .join(", ");
      } else {
        blame = (this.checkData as number[])
          .map((x) => this.palette.colors[x].toHex())
          .join(", ");
      }

      return props.failMessage.replaceAll("{{blame}}", blame);
    }
  };
}
