import type { LintProgram } from "../lint-language/lint-type";
import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { LLEval, prettyPrintLL } from "../lint-language/lint-language";

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
}

export function CreateCustomLint(props: CustomLint) {
  return class CustomLint extends ColorLint<number[], any> {
    name = props.name;
    taskTypes = props.taskTypes;
    level = props.level;
    group = props.group;
    description = props.description;
    hasHeuristicFix = false;
    isCustom = props.id;

    _runCheck() {
      const prog = Json.parse(props.program);
      const { blame, result } = LLEval(prog, this.palette, {
        debugCompare: false,
      });
      return { passCheck: result, data: blame };
    }

    buildMessage() {
      const blame = this.checkData
        .map((x) => this.palette.colors[x].toHex())
        .join(", ");
      return props.failMessage.replace("{{blame}}", blame);
    }
  };
}
