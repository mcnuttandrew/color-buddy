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
  | { absDiff: LintComparisonBase }
  | { similar: { left: LintRef; right: LintRef; threshold: number } };
type MathOperations = "+" | "-" | "*" | "/";
type LintMathOps = Record<MathOperations, Number | LintVariable>;
type LintPairOps =
  | { dist: { left: LintRef; right: LintRef }; space: "lab" | "hsl" }
  | { deltaE: { left: LintRef; right: LintRef }; algorithm: "2000" | "76" }
  | {
      contrast: {
        left: LintRef;
        right: LintRef;
      };
      algorithm:
        | "APCA"
        | "WCAG21"
        | "Michelson"
        | "Weber"
        | "Lstar"
        | "DeltaPhi";
    };
type MapTarget = LintVariable | LintValue[];
type MapEval = LintColorFunction | LintPairOps;
type LintMap =
  | { map: MapTarget; func: MapEval; varb: string }
  | { sort: MapTarget; func: MapEval; varb: string }
  | { reverse: LintVariable | LintValue[] }
  | { filter: MapTarget; func: LintExpression; varb: string }
  | { speed: MapTarget };

type Aggs =
  | "sum"
  | "count"
  | "mean"
  | "max"
  | "min"
  | "mean"
  | "first"
  | "last"
  | "extent"
  | "std";
type LintAggregate = Record<Aggs, LintVariable | any[] | LintMap>;
type LintColorFunction =
  | {
      cvdSim: LintVariable | LintColor;
      type: "protanomaly" | "deuteranomaly" | "tritanopia" | "grayscale";
    }
  | { name: LintVariable | LintColor }
  | { inGamut: LintVariable | LintColor }
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
  | LintAggregate
  | LintColorFunction;

// raw values
type LintBoolean = boolean;
type LintVariable = string;
type LintColor = string | any;
