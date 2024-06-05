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
  | LintBoolean
  | LintColorTagCheck;

/**
 * A logical conjunction expression. It is used to express the logical AND, OR and NOT operations.
 */
export type LintConjunction =
  | { $schema?: string; and: LintExpression[] }
  | { $schema?: string; or: LintExpression[] }
  | { $schema?: string; not: LintExpression };
type LintQuantifierBase =
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
  | { $schema?: string; all: LintQuantifierBase }
  | { $schema?: string; exist: LintQuantifierBase };

// Operations
/**
 * A logical comparison expression. It is used to express a comparison between two values. It can be ==, !=, <, > or similar. similar takes two colors and a similarity threshold expressed in dE units.
 */
export type LintComparison =
  | {
      $schema?: string;
      "==": {
        left: LintValue | LintArrayValue;
        right: LintValue | LintArrayValue;
      };
    }
  | {
      $schema?: string;
      "!=": {
        left: LintValue | LintArrayValue;
        right: LintValue | LintArrayValue;
      };
    }
  | { $schema?: string; "<": { left: LintValue; right: LintValue } }
  | { $schema?: string; ">": { left: LintValue; right: LintValue } }
  | {
      $schema?: string;
      similar: { left: LintValue; right: LintValue; threshold: number };
    };
export type LintMathOps =
  | { "+": { left: LintValue; right: LintValue } }
  | { "-": { left: LintValue; right: LintValue } }
  | { "*": { left: LintValue; right: LintValue } }
  | { "/": { left: LintValue; right: LintValue } }
  // division with round
  | { "//": { left: LintValue; right: LintValue } }
  | { "%": { left: LintValue; right: LintValue } }
  | { absDiff: { left: LintValue; right: LintValue } };

export type LintPairOps =
  | LintPairOpsDist
  | LintPairOpsDeltaE
  | LintPairOpsContrast;

type PairType = LintColor | LintVariable;
/**
 * Compute the distance between two colors using a given color space. The color space can be lab, hsl, or another valid color space.
 */
export type LintPairOpsDist = {
  dist: { left: PairType; right: PairType };
  space: "lab" | "hsl";
};

/**
 * Compute the deltaE between two colors using a given algorithm. The algorithm can be 2000 or 76.
 */
export type LintPairOpsDeltaE = {
  deltaE: { left: PairType; right: PairType };
  algorithm: "2000" | "76";
};

/**
 * Compute the contrast between two colors using a given algorithm. The algorithm can be APCA, WCAG21, Michelson, Weber, Lstar or DeltaPhi.
 */
export type LintPairOpsContrast = {
  contrast: { left: PairType; right: PairType };
  algorithm: "APCA" | "DeltaPhi" | "Lstar" | "Michelson" | "WCAG21" | "Weber";
};

type LintArrayValue = LintVariable | LintValue[] | LintMap;
export type LintMap =
  | { filter: LintArrayValue; func: LintExpression; varb: string }
  | { map: LintArrayValue; func: LintValue; varb: string }
  | { reverse: LintArrayValue }
  | { sort: LintArrayValue; func: LintValue; varb: string }
  | { speed: LintArrayValue };

export type LintAggregate =
  | { count: LintArrayValue }
  | { extent: LintArrayValue }
  | { first: LintArrayValue }
  | { middle: LintArrayValue }
  | { last: LintArrayValue }
  | { max: LintArrayValue }
  | { mean: LintArrayValue }
  | { mean: LintArrayValue }
  | { min: LintArrayValue }
  | { std: LintArrayValue }
  | { sum: LintArrayValue };

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
      toSpace: LintVariable | LintColor | LintAggregate;
      space: ColorSpace;
      channel: ColorChannel;
    }
  | LintColorTagCheck
  | { [cmd: string]: LintVariable | LintAggregate | string };

export type LintColorTagCheck = {
  isTag: LintVariable | LintColor;
  value: string;
};

/**
 * Converts a Color to a color space component. Has syntax like colorSpace.channel, where colorSpace is a color space and channel is a channel in that color space. Available spaces: hsl, hsv, jzazbz, lab, lch, hct, cam16-jmh, oklch, rgb
 */
export type LintColorFunctionToColorShortHand = Record<
  string,
  LintVariable | LintColor
>;

export type ColorSpace =
  // | "oklab"
  | "cam16-jmh"
  | "hct"
  | "hsl"
  | "hsv"
  | "jzazbz"
  | "lab"
  | "lch"
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
  | LintComparison
  | LintMathOps
  | LintPairOps
  | LintAggregate
  | LintColorFunction;

// raw values
export type LintBoolean = boolean;
export type LintVariable = string;
import { Color } from "../Color";
export type LintColor = string | Color | LintVariable;
// export type LintColor = string | LintVariable;
