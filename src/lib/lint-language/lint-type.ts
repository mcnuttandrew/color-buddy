/**
 * Lint Language
 * Lint Language is a language for expressing color logic. It is used to define color rules and constraints in the Lint system.
 */
export type LintProgram = LintExpression;

type LintExpression =
  | LintConjunction
  | LintQuantifier
  | LintComparison
  | LintBoolean;

type LintConjunction =
  | { and: LintExpression[] }
  | { or: LintExpression[] }
  | { not: LintExpression };
type LintQuantifierBase =
  | {
      varbs: LintVariable[];
      where?: LintExpression;
      in: LintVariable | LintValue[] | LintMap;
      predicate: LintExpression;
    }
  | {
      varb: LintVariable;
      where?: LintExpression;
      in: LintVariable | LintValue[] | LintMap;
      predicate: LintExpression;
    };
type LintQuantifier =
  | { all: LintQuantifierBase }
  | { exist: LintQuantifierBase };

// Operations
type LintRef = LintVariable | LintValue | LintValue[] | LintMap;
type LintComparisonBase = { left: LintRef; right: LintRef };
type LintComparison =
  | { "==": LintComparisonBase }
  | { "!=": LintComparisonBase }
  | { "<": LintComparisonBase }
  | { ">": LintComparisonBase }
  | { similar: { left: LintRef; right: LintRef; threshold: number } };
type MathOperations = "+" | "-" | "*" | "/";
type LintMathOps = Record<MathOperations, Number | LintVariable>;
type LintPairOps =
  | { dist: { left: LintRef; right: LintRef; space: "lab" | "hsl" } }
  | { deltaE: { left: LintRef; right: LintRef; algorithm: "2000" | "76" } }
  | {
      contrast: {
        left: LintRef;
        right: LintRef;
        algorithm:
          | "APCA"
          | "WCAG21"
          | "Michelson"
          | "Weber"
          | "Lstar"
          | "DeltaPhi";
      };
    };
type LintMap =
  // | { map: LintVariable | LintValue[]; func: LintColorFunction | LintPairOps }
  // | { sort: LintVariable | LintValue[]; func: LintColorFunction | LintPairOps }
  { filter: LintVariable | LintValue[]; func: LintExpression };

type LintReduce = Record<
  | "sum"
  | "count"
  | "mean"
  | "max"
  | "min"
  | "mean"
  | "first"
  | "last"
  | "extent",
  LintVariable | any[] | LintMap
>;
type LintColorFunction =
  | {
      cvd_sim: LintVariable | LintColor;
      type: "protanomaly" | "deuteranomaly" | "tritanopia" | "grayscale";
    }
  | { name: LintVariable | LintColor }
  | {
      toColor: LintVariable | LintColor;
      space: ColorSpace;
      channel: ColorChannel;
    }
  | Record<`${ColorSpace}.${ColorChannel}`, LintVariable | LintColor>;

type ColorSpace =
  | "hsl"
  | "hsv"
  | "jzazbz"
  | "lab"
  | "lch"
  | "oklab"
  | "oklch"
  | "rgb"
  | "srgb";
type ColorChannel =
  | "a"
  | "az"
  | "b"
  | "b"
  | "bz"
  | "c"
  | "g"
  | "h"
  | "jz"
  | "l"
  | "okc"
  | "okl"
  | "r"
  | "s"
  | "v";

// values
type LintValue =
  | string
  | number
  | boolean
  | LintColor
  | LintVariable
  | LintMathOps
  | LintPairOps
  | LintReduce
  | LintColorFunction;

// raw values
type LintBoolean = boolean;
type LintVariable = string;
type LintColor = string | any;
