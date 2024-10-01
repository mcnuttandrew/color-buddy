import type { Palette } from "color-buddy-palette";

import { LLEval, prettyPrintLL } from "./lint-language/lint-language";
import { permutativeBlame } from "./linter-tools/blame";
import * as Json from "jsonc-parser";

export interface LintProgram {
  blameMode: "pair" | "single" | "none";
  customProgram?: (palette: Palette) => boolean;
  description: string;
  failMessage: string;
  group:
    | "design"
    | "color-accessibility"
    | "contrast-accessibility"
    | "usability"
    | "custom";
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

interface SuccessLintResult {
  kind: "success";
  blameData: Blame;
  message: string;
  naturalLanguageProgram: string;
  passes: boolean;
  lintProgram: LintProgram;
}
interface IgnoredLintResult {
  kind: "ignored";
  lintProgram: LintProgram;
}
interface InvalidLintResult {
  kind: "invalid";
  lintProgram: LintProgram;
}

/**
 * The result of running a lint program on a palette. There are three possible outcomes:
 * - Success: The lint passed or failed as expected {kind: "success"}. It has properties
 * -- blameData: The colors that caused the lint to fail
 * -- message: A message explaining why the lint failed
 * -- naturalLanguageProgram: A human-readable version of the lint program
 * -- passes: Whether the lint passed or failed
 * - Ignored: The lint was ignored {kind: "ignored"}
 * - Invalid: The lint was invalid {kind: "invalid"}
 *
 * All cases also have a lintProgram property that contains the lint program that was run.
 */
export type LintResult =
  | SuccessLintResult
  | IgnoredLintResult
  | InvalidLintResult;

type Blame = number[] | number[][];

function buildMessage(
  lintProgram: LintProgram,
  palette: Palette,
  blameData: Blame
): string {
  let blame = "";
  if (lintProgram.blameMode === "pair") {
    blame = (blameData as number[][])
      .map((x) => `(${x.map((x) => palette.colors[x].toHex()).join(", ")})`)
      .join(", ");
  } else {
    blame = (blameData as number[])
      .map((x) => palette.colors[x].toHex())
      .join(", ");
  }

  return replaceAll(lintProgram.failMessage, "{{blame}}", blame);
}

let parserCache: { [key: string]: any } = {};
const memoParser = (str: string): any => {
  if (parserCache[str]) return parserCache[str];
  const parsed = Json.parse(str);
  parserCache[str] = parsed;
  return parsed;
};

let execCache: { [key: string]: any } = {};
function executeLint(
  lintProgram: LintProgram,
  palette: Palette,
  options: RunLintOptions
): { passCheck: boolean; blame: Blame } {
  const cacheKey = JSON.stringify({
    lintProgram: lintProgram.program,
    blameMode: lintProgram.blameMode,
    palette: palette,
    options,
  });
  if (execCache[cacheKey]) {
    return execCache[cacheKey];
  }
  const prog = memoParser(lintProgram.program);
  const { result } = LLEval(prog, palette, { debugCompare: false, ...options });
  if (result) {
    const out = { passCheck: result, blame: [] };
    execCache[cacheKey] = out;
    return out;
  }
  let blame: Blame = [];
  if (
    (options.computeBlame || options.computeMessage) &&
    lintProgram.blameMode !== "none"
  ) {
    blame = permutativeBlame(prog, palette, lintProgram.blameMode);
  }

  const out = { passCheck: result, blame: deepCopy(blame) };
  execCache[cacheKey] = out;
  return out;
}
const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

let nlProgramCache: Record<string, string> = {};
function getNlProgram(progString: string): string {
  if (nlProgramCache[progString]) return nlProgramCache[progString];
  const prog = memoParser(progString);
  const prettyPrinted = prettyPrintLL(prog);
  nlProgramCache[progString] = prettyPrinted;
  return prettyPrinted;
}

interface RunLintOptions {
  computeBlame?: boolean;
  computeMessage?: boolean;
  debugCompare?: boolean;
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
      kind: "success",
      blameData,
      message: !customPass ? lint.failMessage : "",
      naturalLanguageProgram: "CUSTOM",
      passes: customPass,
      lintProgram: cloneLintProgram(lint),
    };
  }

  const result = executeLint(lint, palette, options);
  blameData = result.blame;
  let natProg = "";
  try {
    natProg = getNlProgram(lint.program);
  } catch (e) {}

  let message = "";
  if (options.computeMessage) {
    message = buildMessage(lint, palette, result.blame);
  }

  return {
    kind: "success",
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
