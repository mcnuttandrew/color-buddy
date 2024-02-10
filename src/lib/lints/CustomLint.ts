import type { LintProgram } from "../lint-language/lint-type";
import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import {
  LLEval,
  prettyPrintLL,
  permutativeBlame,
} from "../lint-language/lint-language";

import * as Json from "jsonc-parser";
export interface CustomLint {
  program: string;
  name: string;
  taskTypes: TaskType[];
  level: "error" | "warning";
  group: string;
  description: string;
  failMessage: string;
  id: string;
  blameMode: "pair" | "single" | "none";
}

export function CreateCustomLint(props: CustomLint) {
  return class CustomLint extends ColorLint<number[] | number[][], any> {
    name = props.name;
    taskTypes = props.taskTypes;
    level = props.level;
    group = props.group;
    description = props.description;
    hasHeuristicFix = false;
    isCustom = props.id;
    blameMode = props.blameMode;

    _runCheck() {
      const prog = Json.parse(props.program);
      const { blame, result } = LLEval(prog, this.palette, {
        debugCompare: false,
      });
      if (result) return { passCheck: true, data: blame };

      return {
        passCheck: result,
        data:
          props.blameMode !== "none"
            ? permutativeBlame(prog, this.palette, props.blameMode)
            : [],
      };
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

      return props.failMessage.replace("{{blame}}", blame);
    }
  };
}
