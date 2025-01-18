import linter, { PREBUILT_LINTS } from "./linter";
import type { LintResult, LintProgram } from "./ColorLint";
import {
  GenerateAST,
  Environment,
  LLTypes,
  prettyPrintLL,
} from "./lint-language/lint-language";
import { suggestMCFix } from "./linter-tools/monte-carlo-fix";
import { suggestLintFix } from "./linter-tools/lint-fixer";
export {
  Environment,
  GenerateAST,
  LLTypes,
  PREBUILT_LINTS,
  linter,
  prettyPrintLL,
  suggestLintFix,
  suggestMCFix,
};
export type { LintResult, LintProgram };
