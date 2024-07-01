import type { Palette } from "@color-buddy/palette";
import { getName } from "@color-buddy/color-namer";
import { Color, ColorSpaceDirectory } from "@color-buddy/palette";

import cvdSim from "../cvd-sim";
import type { LintProgram } from "./lint-type";

type RawValues = string | number | Color | string[] | number[] | Color[];
class Environment {
  constructor(
    private palette: Palette,
    private variables: Record<string, LLVariable | LLValue | LLValueArray>,
    public options: OptionsConfig,
    public colorBlame: Record<number, boolean> = {}
  ) {}
  set(name: string, value: LLVariable | LLValue | LLValueArray) {
    const reserved = new Set(["colors", "background"]);
    if (reserved.has(name)) {
      throw new Error(
        `Cannot set "${name}" as a variable name. It is reserved.`
      );
    }
    if (this.variables[name]) {
      throw new Error(
        `Variable "${name}" already exists and so can not be set`
      );
    }
    const newVariables = { ...this.variables, [name]: value };
    return new Environment(
      this.palette,
      newVariables,
      this.options,
      this.colorBlame
    );
  }
  get(name: string) {
    if (name === "colors") {
      const children = this.palette.colors
        .map((x) => new LLColor(x, x.toHex()))
        .map((x) => new LLValue(x));
      return new LLValueArray(children);
    }
    if (name === "background") {
      return new LLColor(
        this.palette.background,
        this.palette.background.toHex()
      );
    }
    const val = this.variables[name];
    const definedVariables = [
      "colors",
      "background",
      ...Object.keys(this.variables),
    ]
      .map((x) => `"${x}"`)
      .join(", ");
    if (!val)
      throw new Error(
        `Variable "${name}" not found. Defined variables are ${definedVariables}`
      );
    return val;
  }
  toggleBlame(index: number) {
    const newBlame = { ...this.colorBlame, [index]: !this.colorBlame[index] };
    return new Environment(
      this.palette,
      this.variables,
      this.options,
      newBlame
    );
  }
  blameIndices(indices: number[]) {
    const newBlame = indices.reduce(
      (acc, x) => ({ ...acc, [x]: true }),
      this.colorBlame
    );
    return new Environment(
      this.palette,
      this.variables,
      this.options,
      newBlame
    );
  }
  toggleAllBlame() {
    const nothingBlamedYet = Object.values(this.colorBlame).every((x) => !x);
    if (nothingBlamedYet) {
      return this.copy();
    }
    const newBlame = this.palette.colors.reduce(
      (acc, _, i) => ({ ...acc, [i]: !this.colorBlame[i] }),
      {}
    );
    return new Environment(
      this.palette,
      this.variables,
      this.options,
      newBlame
    );
  }
  mergeBlame(other: Record<number, boolean>) {
    const newBlame = { ...this.colorBlame, ...other };
    return new Environment(
      this.palette,
      this.variables,
      this.options,
      newBlame
    );
  }
  copy() {
    return new Environment(
      this.palette,
      { ...this.variables },
      this.options,
      this.colorBlame
    );
  }
}

interface OptionsConfig {
  debugParse: boolean;
  debugEval: boolean;
  debugCompare: boolean;
}
const tryTypes =
  (nodeClasses: any[], options: OptionsConfig) => (node: any) => {
    for (let i = 0; i < nodeClasses.length; i++) {
      const nodeClass = nodeClasses[i];
      if (options.debugParse) {
        console.log(nodeClass.name, node);
      }
      const result = nodeClass.tryToConstruct(node, options);
      if (result) return result;
    }
    return false;
  };

const checkIfValsPresent = (node: Record<any, any>, keys: string[]) =>
  keys.every((key) => key in node);

type ReturnVal<A> = { result: A; env: Environment };
export class LLNode {
  evaluate(env: Environment): ReturnVal<any> {
    this.evalCheck(env);
    throw new Error("Invalid node");
  }
  evalCheck(_env: Environment): void {
    if (_env.options.debugEval) {
      console.log(this.constructor.name);
    }
    return;
  }
  static tryToConstruct(node: any, _options: OptionsConfig): false | LLNode {
    throw new Error("Invalid node" + node);
  }
  toString() {
    return "Node";
  }
}

export class LLExpression extends LLNode {
  constructor(
    private value: LLConjunction | LLPredicate | LLQuantifier | LLBool
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    this.evalCheck(env);
    return this.value.evaluate(env);
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const value = tryTypes(
      [LLConjunction, LLPredicate, LLQuantifier, LLBool],
      options
    )(node);
    if (!value) return false;
    return new LLExpression(value);
  }
  toString(): string {
    return this.value.toString();
  }
}

const ConjunctionTypes = ["and", "or", "not", "none", "id"] as const;
export class LLConjunction extends LLNode {
  constructor(
    private type: (typeof ConjunctionTypes)[number],
    private children: LLConjunction[]
  ) {
    super();
  }

  evaluate(env: Environment): ReturnVal<boolean> {
    this.evalCheck(env);
    const children = this.children;
    switch (this.type) {
      case "id":
      case "and":
        let andEnv = env;
        const result = children.every((child) => {
          const childResult = child.evaluate(andEnv);
          andEnv = andEnv.mergeBlame(childResult.env.colorBlame);
          return childResult.result;
        });
        return { result: result, env: andEnv };
      case "or":
        let orEnv = env;
        const someResult = children.some((child) => {
          const childResult = child.evaluate(orEnv);
          orEnv = orEnv.mergeBlame(childResult.env.colorBlame);
          return childResult.result;
        });
        return { result: someResult, env: orEnv };
      // return { result: children.some((x) => x.evaluate(env).result), env };
      case "not":
        const notResult = children[0].evaluate(env);
        return {
          result: !notResult.result,
          env: notResult.env.toggleAllBlame(),
        };
      case "none":
        return { result: true, env };
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const exprType = ConjunctionTypes.find((x) => node[x]);
    if (!exprType) return false;
    const children = node[exprType];
    if (!children) return false;
    const cleanedChildren = Array.isArray(children) ? children : [children];
    const childrenTypes = cleanedChildren.map(
      tryTypes([LLExpression], options)
    );
    if (childrenTypes.some((x) => x === false)) return false;
    return new LLConjunction(exprType, childrenTypes);
  }
  toString(): string {
    if (this.type === "id") return this.children[0].toString();
    if (this.type === "none") return "";
    if (this.type === "not") return `NOT ${this.children[0].toString()}`;
    return `(${this.children
      .map((x) => x.toString())
      .join(` ${this.type.toUpperCase()} `)})`;
  }
}

export class LLValueArray extends LLNode {
  constructor(private children: LLValue[]) {
    super();
  }
  evaluate(env: Environment): ReturnVal<RawValues[]> {
    this.evalCheck(env);
    const result = this.children.map((x) => x.evaluate(env).result);
    return { result, env };
  }
  static tryToConstruct(children: any, options: OptionsConfig) {
    if (!children || !Array.isArray(children)) return false;
    const childrenTypes = children.map(tryTypes([LLValue], options));
    if (childrenTypes.some((x) => x === false)) return false;
    return new LLValueArray(childrenTypes);
  }
  toString(): string {
    return `[${this.children.map((x) => x.toString()).join(", ")}]`;
  }
}

export class LLBool extends LLNode {
  constructor(private value: boolean) {
    super();
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    this.evalCheck(env);
    return { result: !!this.value, env };
  }
  static tryToConstruct(value: any, _options: OptionsConfig) {
    if (typeof value !== "boolean") return false;
    return new LLBool(value);
  }
  toString(): string {
    return this.value ? "TRUE" : "FALSE";
  }
}

export class LLVariable extends LLNode {
  constructor(private value: string) {
    super();
  }
  evaluate(env: Environment): any {
    this.evalCheck(env);
    const varDeRef = env.get(this.value);
    return varDeRef.evaluate(env);
  }
  static tryToConstruct(value: any, _options: OptionsConfig) {
    if (typeof value !== "string") return false;
    return new LLVariable(value);
  }
  toString(): string {
    return this.value;
  }
}

export class LLColor extends LLNode {
  constructor(
    private value: Color,
    private constructorString: string
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<Color> {
    this.evalCheck(env);

    return { result: this.value, env };
  }
  static tryToConstruct(value: any, _options: OptionsConfig): false | LLColor {
    if (value instanceof Color) {
      return new LLColor(value, value.toHex());
    }
    if (typeof value === "object" && value.color instanceof Color) {
      return new LLColor(value, value.color.toHex());
    }
    if (typeof value === "string" && Color.stringIsColor(value, "lab")) {
      return new LLColor(Color.colorFromString(value, "lab"), value);
    }
    return false;
  }
  toString(): string {
    return this.constructorString;
    // return this.value.toHex();
  }
}

export class LLNumber extends LLNode {
  constructor(private value: number) {
    super();
  }
  evaluate(env: Environment): ReturnVal<number> {
    this.evalCheck(env);
    return { result: this.value, env };
  }
  static tryToConstruct(value: any, _options: OptionsConfig) {
    if (typeof value !== "number") return false;
    return new LLNumber(value);
  }
  toString(): string {
    return this.value.toString();
  }
}

const LLNumberOpTypes = ["+", "-", "*", "/", "//", "absDiff", "%"] as const;
export class LLNumberOp extends LLNode {
  constructor(
    private type: (typeof LLNumberOpTypes)[number],
    private left: LLValue,
    private right: LLValue
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<number> {
    this.evalCheck(env);
    const left = this.left.evaluate(env).result;
    const right = this.right.evaluate(env).result;
    switch (this.type) {
      case "+":
        return { result: left + right, env };
      case "-":
        return { result: left - right, env };
      case "*":
        return { result: left * right, env };
      case "/":
        return { result: left / right, env };
      case "//":
        return { result: Math.round(left / right), env };
      case "absDiff":
        return { result: Math.abs(left - right), env };
      case "%":
        return { result: left % right, env };
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const opType = LLNumberOpTypes.find((x) => node[x]);
    if (!opType) return false;
    const { left, right } = node[opType];
    if (!checkIfValsPresent(node[opType], ["left", "right"])) {
      throw new Error(`Missing left or right for ${opType}`);
    }
    const leftType = tryTypes([LLValue], options)(left);
    const rightType = tryTypes([LLValue], options)(right);
    if (!leftType || !rightType) {
      throw new Error(`Type error in ${opType}`);
    }
    return new LLNumberOp(opType, leftType, rightType);
  }
  toString(): string {
    const left = this.left.toString();
    const right = this.right.toString();
    if (this.type === "absDiff") {
      // return `absDiff(${left}, ${right})`;
      return `|${left} - ${right}|`;
    }
    return `${left} ${this.type} ${right}`;
  }
}

const predicateTypes = ["==", "!=", ">", "<", "similar"] as const;

type CompareType = number | boolean | string | Color;
function compareValues(
  leftVal: CompareType,
  rightVal: CompareType,
  pred: LLPredicate,
  showValues: boolean
) {
  let isColor = getType(leftVal) === "Color";
  let left = leftVal;
  let right = rightVal;
  if (isColor && pred.type !== "similar") {
    left = (leftVal as Color).toHex();
    right = (rightVal as Color).toHex();
  }
  if (showValues) {
    console.log(pred.type, left, right);
  }
  switch (pred.type) {
    case "similar":
      let thresh = pred.threshold;
      if (!thresh) throw new Error("Similarity threshold not found");
      if (isColor) {
        let localLeft = left as Color;
        let localRight = right as Color;
        const diff = localLeft.symmetricDeltaE(localRight, "2000");
        if (showValues) {
          console.log(
            "diff",
            diff,
            thresh,
            localLeft.toHex(),
            localRight.toHex()
          );
        }
        return diff < thresh;
      }
      if (typeof left === "number" && typeof right === "number") {
        return Math.abs(left - right) < thresh;
      }
      throw new Error(
        `Type error. Similar must be used with colors or numbers. 
        Got ${JSON.stringify(left)} and ${JSON.stringify(right)}`
      );
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
      return left > right;
    case "<":
      return left < right;
  }
}
const getType = (x: any) => {
  if (x?.color instanceof Color) return "Color";
  return typeof x === "object"
    ? Array.isArray(x)
      ? "Array"
      : "object"
    : typeof x;
};
export class LLPredicate extends LLNode {
  constructor(
    public type: (typeof predicateTypes)[number],
    private left: LLValue | LLValueArray | LLMap,
    private right: LLValue | LLValueArray | LLMap,
    public threshold?: number
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    this.evalCheck(env);
    const showValues = env.options.debugCompare;
    const { left, right } = this;
    let leftEval = left.evaluate(env).result;
    let rightEval = right.evaluate(env).result;
    const leftType = getType(leftEval);
    const rightType = getType(rightEval);
    // allow comparing colors and strings
    if (leftType === "string" && rightType === "Color") {
      rightEval = right.toString();
    } else if (leftType === "Color" && rightType === "string") {
      leftEval = left.toString();
    } else if (leftType !== rightType) {
      throw new Error(
        `Type error on predicate "${this.type}": left and right types must be the same. 
        Got ${leftType} and ${rightType}`
      );
    }
    // array
    if (Array.isArray(leftEval)) {
      if (leftEval.length !== rightEval.length) {
        throw new Error(
          `Array length mismatch. Left: ${leftEval.length}, Right: ${rightEval.length}`
        );
      }
      return {
        result: leftEval.every((x, i) =>
          compareValues(x, rightEval[i], this, showValues)
        ),
        env,
      };
    }
    // single value
    return {
      result: compareValues(leftEval, rightEval, this, showValues),
      env,
    };
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const predicateType = predicateTypes.find((x) => node[x]);
    if (!predicateType) return false;
    const { left, right, threshold } = node[predicateType];
    if (!checkIfValsPresent(node[predicateType], ["left", "right"]))
      return false;
    const leftType = tryTypes([LLValue, LLValueArray, LLMap], options)(left);
    const rightType = tryTypes([LLValue, LLValueArray, LLMap], options)(right);
    if (!leftType || !rightType) return false;
    return new LLPredicate(predicateType, leftType, rightType, threshold);
  }
  toString(): string {
    let type = "" + this.type;
    const left = this.left.toString();
    const right = this.right.toString();
    if (this.type === "similar") {
      return `similar(${left}, ${right}) < ${this.threshold}`;
    }
    return `${left} ${type} ${right}`;
  }
}

export class LLValue extends LLNode {
  constructor(
    private value:
      | LLValueFunction
      | LLPairFunction
      | LLColor
      | LLNumber
      | LLVariable
      | LLAggregate
      | LLNumberOp
  ) {
    super();
  }
  evaluate(env: Environment) {
    this.evalCheck(env);
    return this.value.evaluate(env);
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const types = [
      LLValueFunction,
      LLPairFunction,
      LLBool,
      LLColor,
      LLNumber,
      LLVariable,
      LLAggregate,
      LLNumberOp,
    ];
    const value = tryTypes(types, options)(node);
    if (!value) return false;
    return value;
  }
  toString(): string {
    return this.value.toString();
  }
}

type Params = Record<string, string>;
const VFTypes: {
  primaryKey: string;
  params: string[];
  op: (val: Color, params: Params) => any;
}[] = [
  {
    primaryKey: "cvdSim",
    params: ["type"] as string[],
    op: (val, params) => ({ ...val, color: cvdSim(params.type, val) }),
  },
  {
    primaryKey: "name",
    params: [] as string[],
    op: (val, _params) => getName(val).toLowerCase(),
  },
  {
    primaryKey: "toSpace",
    params: ["space", "channel"] as string[],
    op: (val, params) =>
      Number(val.toColorSpace(params.space as any).getChannel(params.channel)),
  },
  {
    primaryKey: "inGamut",
    params: [],
    op: (val, _params) => val.inGamut(),
  },
  {
    primaryKey: "isTag",
    params: ["value"],
    op: (val, params) => {
      const tag = params.value.toLowerCase();
      return val.tags.some((x) => x.toLowerCase() === tag);
    },
  },
];

Object.entries(ColorSpaceDirectory).map(([colorSpace, space]) => {
  (["x", "y", "z"] as const).forEach((channel) => {
    const channelKey = space.dimensionToChannel[channel];
    VFTypes.push({
      primaryKey: `${colorSpace}.${channelKey.toLowerCase()}`,
      params: [] as string[],
      op: (val: Color, _params: Params) =>
        Number(val.toColorSpace(colorSpace as any).getChannel(channelKey)),
    });
  });
});

export class LLValueFunction extends LLNode {
  constructor(
    private type: (typeof VFTypes)[number]["primaryKey"],
    private input: LLColor | LLVariable,
    private params: Record<string, string>
  ) {
    super();
  }
  evaluate(env: Environment) {
    this.evalCheck(env);
    const { input, params } = this;
    // get the value of the input, such as by deref
    const inputEval = input.evaluate(env).result;
    if (!(typeof inputEval === "object" && inputEval.color instanceof Color)) {
      throw new Error(
        `Type error, was expecting a color, but got ${inputEval} in function ${this.type}`
      );
    }
    const op = VFTypes.find((x) => x.primaryKey === this.type);
    if (!op) throw new Error("Invalid type");
    const result = op.op(inputEval, params);
    if (result === undefined) {
      throw new Error("Invalid result");
    }
    return { result, env };
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const inputTypes = [LLAggregate, LLColor, LLVariable];
    // find the appropriate type and do a simple type check
    const op = getOp(VFTypes)(node);
    if (!op) return false;
    const input = tryTypes(inputTypes, options)(node[op.primaryKey]);
    if (!input) return false;
    const params = getParams(op, node);
    return new LLValueFunction(op.primaryKey, input, params);
  }
  toString(): string {
    const params = Object.values(this.params).join(", ");
    const paramString = params.length ? `, ${params}` : "";
    return `${this.type}(${this.input.toString()}${paramString})`;
  }
}

const getOp =
  (ops: typeof VFTypes | typeof LLPairFunctionTypes) => (node: any) =>
    ops.find((x) => {
      const pk = node[x.primaryKey];
      if (!pk) return false;
      // special short circuit bc theres a collision between Color and name
      if (node.spaceName) {
        return false;
      }
      const allParamsFound = x.params.every((key) => key in node);
      const noExtraParams = Object.keys(node).every(
        (key) => (x.params as string[]).includes(key) || key === x.primaryKey
      );
      const allowedParamsMessage = x.params.length
        ? `Allowed params are ${x.params.map((x) => `"${x}"`).join(", ")}`
        : "No params allowed" + Object.keys(node);
      if (!allParamsFound) {
        throw new Error(
          `Missing params for ${x.primaryKey}. ${allowedParamsMessage}`
        );
      }
      if (!noExtraParams) {
        throw new Error(
          `Extra params for ${x.primaryKey}. ${allowedParamsMessage}`
        );
      }
      return allParamsFound && noExtraParams;
    });
const getParams = (op: any, node: any) =>
  op.params.reduce((acc: any, key: any) => ({ ...acc, [key]: node[key] }), {});

const LLPairFunctionTypes: {
  primaryKey: string;
  params: string[];
  op: (a: Color, b: Color, params: Params) => number;
}[] = [
  {
    primaryKey: "dist",
    params: ["space"] as string[],
    op: (valA, valB, params) => valA.distance(valB, params.space as any),
  },
  {
    primaryKey: "deltaE",
    params: ["algorithm"] as string[],
    op: (valA, valB, params) =>
      valA.symmetricDeltaE(valB, params.algorithm as any),
  },
  {
    primaryKey: "contrast",
    params: ["algorithm"] as string[],
    op: (valA, valB, params) => {
      const a = valA.toColorIO();
      const b = valB.toColorIO();
      return Math.abs(a.contrast(b, params.algorithm as any));
    },
  },
];
export class LLPairFunction extends LLNode {
  constructor(
    private type: (typeof LLPairFunctionTypes)[number]["primaryKey"],
    private left: LLColor | LLVariable,
    private right: LLColor | LLVariable,
    private params: Record<string, string>
  ) {
    super();
  }
  evaluate(env: Environment) {
    this.evalCheck(env);
    const { left, right, params } = this;
    // get the value of the input, such as by deref
    const leftEval = left.evaluate(env).result;
    const rightEval = right.evaluate(env).result;
    if (!(leftEval instanceof Color) || !(rightEval instanceof Color)) {
      throw new Error("Type error");
    }
    const op = LLPairFunctionTypes.find((x) => x.primaryKey === this.type);
    if (!op) throw new Error("Invalid type");
    const result = op.op(leftEval, rightEval, params);
    if (result === undefined) {
      throw new Error("Invalid result");
    }
    return { result, env };
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const inputTypes = [LLColor, LLVariable];
    // find the appropriate type and do a simple type check
    const op = getOp(LLPairFunctionTypes)(node);
    if (!op) return false;
    const { left, right } = node[op.primaryKey];
    const leftType = tryTypes(inputTypes, options)(left);
    const rightType = tryTypes(inputTypes, options)(right);

    if (!leftType || !rightType) return false;
    const params = getParams(op, node);
    return new LLPairFunction(op.primaryKey, leftType, rightType, params);
  }

  toString() {
    const params = Object.values(this.params).join(", ");
    const paramString = params.length ? `, ${params}` : "";
    return `${
      this.type
    }(${this.left.toString()}, ${this.right.toString()}${paramString})`;
  }
}

let f = (a: any[], b: any[]) =>
  [].concat(...(a.map((a) => b.map((b) => [].concat(a, b))) as any));
let cartesian = (a: any[], b: any[], ...c: any[]): any[] =>
  b ? (cartesian as any)(f(a, b), ...c) : a;

const QuantifierTypes = ["exist", "all"] as const;
const QuantifierTypeErrors = [{ wrong: "exists", right: "exist" }] as const;
export class LLQuantifier extends LLNode {
  constructor(
    private type: (typeof QuantifierTypes)[number],
    private input: LLValueArray | LLVariable | LLMap,
    private predicate: LLPredicate,
    private varbs: string[],
    private where?: LLPredicate | LLValueFunction
  ) {
    super();
  }
  evaluate(env: Environment) {
    this.evalCheck(env);
    // weird restoration of type information to make the forward stuff work
    const type = tryTypes([LLValueArray, LLValue, LLMap], env.options);
    const idxType = tryTypes([LLValue], env.options);
    // materialize all combinations of the variables for each of the inputs
    const inputData = this.input
      .evaluate(env)
      .result.map((x: any, index: number) => [index, type(x)]);

    const indices = inputData.map((_x: any, idx: number) => idx) as number[];
    // take the cartesian product of the variables and the data
    const carts = (cartesian as any)(...this.varbs.map(() => indices)).map(
      (x: any) => (Array.isArray(x) ? x : [x])
    );
    let blameIndices = new Set<number>([]);
    let topEnv = env.copy();
    const mappedEvaluations = carts
      .map((combo: any) => {
        const varbIndex = this.varbs.map((varb, idx) => {
          return [varb, inputData[combo[idx]]];
        });
        const newEnv = varbIndex.reduce((acc, [varb, [index, x]]) => {
          return acc.set(varb, x).set(`index(${varb})`, idxType(index + 1));
        }, env);
        ("");
        if (this.where && !this.where.evaluate(newEnv).result) {
          return "skip";
        }
        const evalPred = this.predicate.evaluate(newEnv);
        topEnv = topEnv.mergeBlame(evalPred.env.colorBlame);
        if (evalPred.result === false) {
          combo.forEach((x: number) => blameIndices.add(x));
        }
        return evalPred.result;
      })
      .filter((x: any) => x !== "skip") as boolean[];

    // todo don't try to do blame indices if its not looking at color
    const isColor =
      this.input.constructor.name === "LLVariable" &&
      this.input.toString() === "colors";
    const blameArray = isColor ? Array.from(blameIndices) : [];

    switch (this.type) {
      case "exist":
        if (mappedEvaluations.some((x) => x)) {
          return { result: true, env: topEnv };
        } else {
          return { result: false, env: topEnv.blameIndices(blameArray) };
        }
      case "all":
        if (mappedEvaluations.every((x) => x)) {
          return { result: true, env: topEnv };
        } else {
          return { result: false, env: topEnv.blameIndices(blameArray) };
        }
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const quantifierType = QuantifierTypes.find((x) => node[x]);
    const knownQuantErr = QuantifierTypeErrors.find((x) => node[x.wrong]);
    if (knownQuantErr) {
      throw new Error(
        `Invalid quantifier type "${knownQuantErr.wrong}", did you mean "${knownQuantErr.right}"?`
      );
    }
    if (!quantifierType) return false;
    const { predicate, varb, varbs, where } = node[quantifierType];
    const input = node[quantifierType].in;
    // must have both an input and a predicate
    if (!input || !predicate) return false;
    // must have a variable or variables
    if (!varb && !varbs) return false;

    const inputType = tryTypes(
      [LLValueArray, LLVariable, LLMap],
      options
    )(input);
    const predicateType = tryTypes([LLExpression], options)(predicate);
    if (!inputType || !predicateType) return false;
    return new LLQuantifier(
      quantifierType,
      inputType,
      predicateType,
      varb ? [varb] : varbs,
      where && tryTypes([LLPredicate, LLValueFunction], options)(where)
    );
  }
  toString(): string {
    const varbs = this.varbs.join(", ");
    let target = this.input.toString();
    if (target !== "colors") {
      target = `(${target})`;
    }
    let where = "";
    if (this.where) {
      where = ` WHERE ${this.where.toString()}`;
    }
    // const type = this.type === "exist" ? "∃" : "∀";
    const type = this.type.toUpperCase();
    const pred = this.predicate.toString();
    return `${type} ${varbs} IN ${target}${where} SUCH THAT ${pred}`;
  }
}

const reduceTypes = [
  "count",
  "sum",
  "min",
  "max",
  "mean",
  "std",
  "first",
  "middle",
  "last",
  "extent",
] as const;
export class LLAggregate extends LLNode {
  constructor(
    private type: (typeof reduceTypes)[number],
    private children: LLValueArray | LLVariable | LLMap
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<number> {
    this.evalCheck(env);
    const children = this.children.evaluate(env).result;
    if (!Array.isArray(children)) {
      throw new Error(
        "Type error, aggregate received something that was an array"
      );
    }
    switch (this.type) {
      case "count":
        return { result: children.length, env };
      case "first":
        return { result: children[0], env };
      case "last":
        return { result: children[children.length - 1], env };
      case "middle":
        return { result: children[Math.floor(children.length / 2)], env };
      case "sum":
        return { result: children.reduce((a, b) => a + b, 0), env };
      case "std":
        const sum = children.reduce((a, b) => a + b, 0);
        const mean = sum / children.length;
        const variance =
          children.reduce((a, b) => a + (b - mean) ** 2, 0) / children.length;
        return { result: Math.sqrt(variance), env };
      case "mean":
        return {
          result: children.reduce((a, b) => a + b, 0) / children.length,
          env,
        };
      case "min":
        return { result: Math.min(...children), env };
      case "max":
        return { result: Math.max(...children), env };
      case "extent":
        return {
          result: Math.abs(Math.max(...children) - Math.min(...children)),
          env,
        };
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const reduceType = reduceTypes.find((x) => node[x]);
    if (node.avg) {
      throw new Error("Did you mean mean instead of avg?");
    }
    if (!reduceType) return false;
    const children = node[reduceType];
    if (!children) return false;
    let childType;
    if (Array.isArray(children)) {
      childType = tryTypes([LLValueArray], options)(children);
    } else {
      childType = tryTypes([LLVariable, LLMap], options)(children);
    }
    if (!childType) {
      throw new Error(`Type error in ${reduceType}`);
    }
    return new LLAggregate(reduceType, childType);
  }
  toString(): string {
    return `${this.type}(${this.children.toString()})`;
  }
}

const mapTypes = ["map", "filter", "sort", "reverse", "speed"] as const;
// example syntax
// {map: colors, func: {cvdSim: {type: "protanomaly"}}, varb: "x"}
export class LLMap extends LLNode {
  constructor(
    private type: (typeof mapTypes)[number],
    private children: LLValueArray | LLVariable | LLMap,
    private func: LLValueFunction | LLPairFunction | LLNumberOp,
    private varb: string
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<RawValues[]> {
    this.evalCheck(env);
    const children = this.children.evaluate(env).result;
    if (!Array.isArray(children)) {
      throw new Error("Type error");
    }
    const newVal = tryTypes([LLValue], env.options);
    const idxType = tryTypes([LLValue], env.options);
    const evalFunc = (x: any, index: number) => {
      const newEnv = env
        .set(this.varb, newVal(x))
        .set(`index(${this.varb})`, idxType(index + 1));
      return this.func.evaluate(newEnv).result;
    };
    // implicitly ignore the pass back i guess?
    switch (this.type) {
      case "map":
        return { result: children.map(evalFunc) as RawValues[], env };
      case "filter":
        return { result: children.filter(evalFunc), env };
      case "sort":
        let childrenCopy = [...children].map(evalFunc) as RawValues[];
        childrenCopy = childrenCopy.sort((a, b) => {
          if (typeof a === "number" && typeof b === "number") {
            return a - b;
          }
          return a.toString().localeCompare(b.toString());
        });
        return { result: childrenCopy, env };
      case "reverse":
        const childrenCopy2 = [...children];
        childrenCopy2.reverse();
        return { result: childrenCopy2, env };
      case "speed":
        // todo maybe make this take algorithm as argument?
        const speed = [];
        const allNumbers = children.every(
          (x) =>
            typeof x === "number" ||
            (typeof x === "object" && x?.type === "<number>")
        );
        const allColors = children.every((x) => x instanceof Color);
        if (!allNumbers && !allColors) {
          const types = children.map((x) => x);
          console.log(children);
          throw new Error(
            `Type error, speed must receive all numbers or all colors, got ${types}`
          );
        }
        for (let i = 0; i < children.length - 1; i++) {
          const a = children[i];
          const b = children[i + 1];
          if (allNumbers) {
            speed.push(Math.abs(a - b));
          } else {
            speed.push(a.symmetricDeltaE(b, "2000"));
          }
        }
        if (speed.length === 0) {
          return { result: [0], env };
        }
        return { result: speed, env };
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const op = mapTypes.find((x) => node[x]);
    if (!op) return false;
    const childType =
      node[op] &&
      tryTypes([LLValueArray, LLVariable, LLMap], options)(node[op]);
    let varb = node.varb;
    let func;
    if (op === "filter") {
      func = tryTypes([LLExpression], options)(node.func);
    } else if (op === "reverse" || op === "speed") {
      // reverse doesn't take any arguments besides the target
      varb = " ";
      func = " ";
    } else {
      func = tryTypes(
        [LLValueFunction, LLPairFunction, LLNumberOp],
        options
      )(node.func);
    }
    if (!func || !childType || !varb) {
      throw new Error(
        `Failed while parsing ${op}. func=${func}, child=${childType}, varb=${varb}`
      );
      return false;
    }
    return new LLMap(op, childType, func, varb);
  }
  toString(): string {
    const type = this.type;
    const funcStr = this.func.toString();
    const func =
      this.varb != " " && funcStr != " " ? `, ${this.varb} => ${funcStr}` : "";
    return `${type}(${this.children.toString()}${func})`;
  }
}

function parseToAST(root: any, options: OptionsConfig) {
  const node = LLExpression.tryToConstruct(root, options);
  if (!node) {
    console.log(root);
    throw new Error(
      "Parsing failed. There was an invalid node somewhere." + root
    );
  }
  return node;
}

const DEFAULT_OPTIONS = {
  debugParse: false,
  debugEval: false,
  debugCompare: false,
};
export function LLEval(
  root: LintProgram,
  palette: Palette,
  options: Partial<typeof DEFAULT_OPTIONS> = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const inputEnv = new Environment(palette, {}, opts, {});
  const ast = parseToAST({ id: [root] }, opts);

  const { result, env } = ast.evaluate(inputEnv);
  const blame = Object.entries(env.colorBlame)
    .filter((x) => x[1])
    .map((x) => +x[0]);

  return { result, blame };
}

export function prettyPrintLL(
  root: any,
  options: Partial<typeof DEFAULT_OPTIONS> = {}
) {
  if (typeof root !== "object") {
    throw new Error("Root must be an object");
    return "";
  }
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const ast = parseToAST({ id: [root] }, opts);
  return ast.toString();
}
