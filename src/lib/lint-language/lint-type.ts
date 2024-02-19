/**
 * Lint Language
 * Lint Language is a language for expressing color logic. It is used to define color rules and constraints in the Lint system.
 */
export type LintProgram = LintExpression;

/**
 * A LintExpression is a JSON object that represents a logical expression. It is used to express a condition that is evaluated to a boolean value. It can be a conjunction, a quantifier, a comparison or a boolean value.
 */
export type LintExpression =
  | LintConjunction
  | LintQuantifier
  | LintComparison
  | LintBoolean;

/**
 * A logical conjunction expression. It is used to express the logical AND, OR and NOT operations.
 */
export type LintConjunction =
  | { and: LintExpression[] }
  | { or: LintExpression[] }
  | { not: LintExpression };
export type LintQuantifierBase =
  | {
      varbs: LintVariable[];
      /**
       * An optional condition to filter the elements in the collection. "
       */
      where?: LintExpression;
      /**
       * The collection to iterate over. It can be a variable, an array or a map.
       */
      in: LintVariable | LintValue[] | LintMap;
      predicate: LintExpression;
    }
  | {
      varb: LintVariable;
      /**
       * An optional condition to filter the elements in the collection.
       */
      where?: LintExpression;
      /**
       * The collection to iterate over. It can be a variable, an array or a map.
       */
      in: LintVariable | LintValue[] | LintMap;
      predicate: LintExpression;
    };

/**
 * A logical quantifier expression. It is used to express the existence of a value (exist) or the existence of a value for all elements in a collection (all).
 */
export type LintQuantifier =
  | { all: LintQuantifierBase }
  | { exist: LintQuantifierBase };

// Operations
export type LintRef = LintVariable | LintValue | LintValue[] | LintMap;

/**
 * A logical comparison expression. It is used to express a comparison between two values. It can be ==, !=, <, > or similar. similar takes two colors and a similarity threshold expressed in dE units.
 */
export type LintComparison =
  | { "==": { left: LintRef; right: LintRef } }
  | { "!=": { left: LintRef; right: LintRef } }
  | { "<": { left: LintRef; right: LintRef } }
  | { ">": { left: LintRef; right: LintRef } }
  | { absDiff: { left: LintRef; right: LintRef } }
  | { similar: { left: LintRef; right: LintRef; threshold: number } };
export type MathOperations = "+" | "-" | "*" | "/";
export type LintMathOps = Record<MathOperations, Number | LintVariable>;

export type LintPairOps =
  | LintPairOpsDist
  | LintPairOpsDeltaE
  | LintPairOpsContrast;

/**
 * Compute the distance between two colors using a given color space. The color space can be lab, hsl, or another valid color space.
 */
export type LintPairOpsDist = {
  dist: { left: LintRef; right: LintRef };
  space: "lab" | "hsl";
};

/**
 * Compute the deltaE between two colors using a given algorithm. The algorithm can be 2000 or 76.
 */
export type LintPairOpsDeltaE = {
  deltaE: { left: LintRef; right: LintRef };
  algorithm: "2000" | "76";
};

/**
 * Compute the contrast between two colors using a given algorithm. The algorithm can be APCA, WCAG21, Michelson, Weber, Lstar or DeltaPhi.
 */
export type LintPairOpsContrast = {
  contrast: {
    left: LintRef;
    right: LintRef;
  };
  algorithm: "APCA" | "WCAG21" | "Michelson" | "Weber" | "Lstar" | "DeltaPhi";
};

export type MapEval = LintColorFunction | LintPairOps;
export type LintMap =
  | { map: LintVariable | LintValue[]; func: MapEval; varb: string }
  | { sort: LintVariable | LintValue[]; func: MapEval; varb: string }
  | { reverse: LintVariable | LintValue[] }
  | { filter: LintVariable | LintValue[]; func: LintExpression; varb: string }
  | { speed: LintVariable | LintValue[] };

export type Aggs =
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
export type LintAggregate = Record<
  Aggs,
  LintVariable | (LintVariable | LintValue)[] | LintMap
>;

/**
 * Simulate color vision deficiency. The type can be protanomaly, deuteranomaly, tritanopia or grayscale.
 */
export type LintColorFunctionCvdSim = {
  cvdSim: LintVariable | LintColor;
  type: "protanomaly" | "deuteranomaly" | "tritanopia" | "grayscale";
};
export type LintColorFunction =
  | LintColorFunctionCvdSim
  | { name: LintVariable | LintColor }
  | { inGamut: LintVariable | LintColor }
  | {
      toColor: LintVariable | LintColor;
      space: ColorSpace;
      channel: ColorChannel;
    }
  | Record<string, LintVariable | LintColor>;

/**
 * Converts a Color to a color space component. Has syntax like colorSpace.channel, where colorSpace is a color space and channel is a channel in that color space. Available spaces: hsl, hsv, jzazbz, lab, lch, oklab, oklch, rgb
 */
export type LintColorFunctionToColorShortHand = Record<
  string,
  LintVariable | LintColor
>;

export type ColorSpace =
  | "hsl"
  | "hsv"
  | "jzazbz"
  | "lab"
  | "lch"
  | "oklab"
  | "oklch"
  | "rgb"
  | "srgb";
export type ColorChannel =
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

/**
 * A LintValue is a JSON object that represents a value. It can be a string, a number, a boolean, a LintColor, a LintVariable, a LintMathOps, a LintPairOps, a LintAggregate, a LintColorFunction or a LintExpression
 */
export type LintValue =
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
export type LintBoolean = boolean;
export type LintVariable = string;
export type LintColor = string;
