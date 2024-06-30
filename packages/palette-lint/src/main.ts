import linter, { PREBUILT_LINTS } from "./linter";
import type { LintResult, LintProgram } from "./ColorLint";
import { generateMCFix } from "./linter-tools/monte-carlo-fix";
import simulateCVD from "./cvd-sim";
import { suggestLintFix } from "./linter-tools/lint-fixer";
export { PREBUILT_LINTS, generateMCFix, linter, simulateCVD, suggestLintFix };
export type { LintResult, LintProgram };
