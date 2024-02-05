import type { LintProgram } from "../lint-language/lint-type";
import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { LLEval, prettyPrintLL } from "../lint-language/lint-language";

export interface CustomLint {
  program: LintProgram;
  name: string;
  taskTypes: TaskType[];
  level: "error" | "warning";
  group: string;
  description: string;
  failMessage: string;
}

export function CreateCustomLint(props: CustomLint) {
  return class CustomLint extends ColorLint<any, any> {
    name = props.name;
    taskTypes = props.taskTypes;
    level = props.level;
    group = props.group;
    description = props.description;
    hasHeuristicFix = false;

    _runCheck() {
      const { blame, result } = LLEval(props.program, this.palette);
      return { passCheck: result, data: blame };
    }

    buildMessage() {
      console.log("todo inject blame");
      return props.failMessage;
    }
  };
}
