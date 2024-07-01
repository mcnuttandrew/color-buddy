import linter, { PREBUILT_LINTS } from "./linter";
import type { LintResult, LintProgram } from "./ColorLint";
import { suggestMCFix } from "./linter-tools/monte-carlo-fix";
import { suggestLintFix } from "./linter-tools/lint-fixer";
export { PREBUILT_LINTS, suggestMCFix, linter, suggestLintFix };
export type { LintResult, LintProgram };
