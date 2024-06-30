import type { Palette } from "../../palette/src/types";

import { LLEval, prettyPrintLL } from "./lint-language/lint-language";
import { permutativeBlame } from "./linter-tools/blame";
import * as Json from "jsonc-parser";

export interface LintProgram {
  blameMode: "pair" | "single" | "none";
  customProgram?: (palette: Palette) => boolean;
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

export interface LintResult {
  blameData: Blame;
  message: string;
  naturalLanguageProgram: string;
  passes: boolean;
  lintProgram: LintProgram;
}

type Blame = number[] | number[][];

function buildMessage(
  lintProgram: LintProgram,
  palette: Palette,
  blameData: Blame
): string {
  let blame = "";
  if (lintProgram.blameMode === "pair") {
    blame = (blameData as number[][])
      .map((x) => x.map((x) => palette.colors[x].color.toHex()).join(" and "))
      .join(", ");
  } else {
    blame = (blameData as number[])
      .map((x) => palette.colors[x].color.toHex())
      .join(", ");
  }

  return replaceAll(lintProgram.failMessage, "{{blame}}", blame);
}

function executeLint(
  lintProgram: LintProgram,
  palette: Palette,
  options: RunLintOptions
): { passCheck: boolean; blame: Blame } {
  const prog = Json.parse(lintProgram.program);
  const { result } = LLEval(prog, palette, {
    debugCompare: false,
    // ...options,
  });
  if (result) return { passCheck: true, blame: [] };
  let blame: Blame = [];
  if (
    (options.computeBlame || options.computeMessage) &&
    lintProgram.blameMode !== "none"
  ) {
    blame = permutativeBlame(prog, palette, lintProgram.blameMode);
  }

  return { passCheck: result, blame };
}

interface RunLintOptions {
  computeBlame?: boolean;
  computeMessage?: boolean;
}

export function RunLint(
  lint: LintProgram,
  palette: Palette,
  options: RunLintOptions
): LintResult {
  let blameData: Blame = [];
  if (lint.customProgram) {
    const customPass = lint.customProgram(palette);
    return {
      blameData,
      message: !customPass ? lint.failMessage : "",
      naturalLanguageProgram: "CUSTOM",
      passes: customPass,
      lintProgram: cloneLintProgram(lint),
    };
  }

  const result = executeLint(lint, palette, options);
  let natProg = "";
  let prog = false;
  try {
    prog = Json.parse(lint.program);
    natProg = prettyPrintLL(prog);
  } catch (e) {}

  let message = "";
  if (options.computeMessage) {
    message = buildMessage(lint, palette, result.blame);
  }

  return {
    blameData,
    message,
    naturalLanguageProgram: natProg,
    passes: result.passCheck,
    lintProgram: cloneLintProgram(lint),
  };
}

function cloneLintProgram(lint: LintProgram): LintProgram {
  return {
    blameMode: lint.blameMode,
    customProgram: lint.customProgram,
    description: lint.description,
    failMessage: lint.failMessage,
    group: lint.group,
    id: lint.id,
    level: lint.level,
    name: lint.name,
    program: lint.program,
    subscribedFix: lint.subscribedFix,
    taskTypes: lint.taskTypes,
    requiredTags: lint.requiredTags,
    expectedPassingTests: lint.expectedPassingTests,
    expectedFailingTests: lint.expectedFailingTests,
  };
}

function replaceAll(str: string, find: string, replace: string) {
  return str.split(find).join(replace);
}
