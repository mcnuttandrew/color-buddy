import cvd_sim from "../blindness";
import type { Palette } from "../../stores/color-store";
import { Color, colorPickerConfig } from "../Color";
import { getName } from "../lints/name-discrim";
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
      throw new Error(`Cannot set ${reserved}`);
    }
    if (this.variables[name]) {
      throw new Error("Variable already exists");
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
        .map((x) => new LLColor(x))
        .map((x) => new LLValue(x));
      return new LLValueArray(children);
    }
    const val = this.variables[name];
    if (!val) throw new Error("Variable not found");
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
  debugTypeCheck: boolean;
  debugEval: boolean;
}
const tryTypes =
  (nodeClasses: any[], options: OptionsConfig) => (node: any) => {
    for (let i = 0; i < nodeClasses.length; i++) {
      const nodeClass = nodeClasses[i];
      if (options.debugTypeCheck) {
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
  static tryToConstruct(node: any, options: OptionsConfig): false | LLNode {
    throw new Error("Invalid node", node);
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
    return this.children.map((x) => x.toString()).join(` ${this.type} `);
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
  static tryToConstruct(value: any, options: OptionsConfig) {
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
  static tryToConstruct(value: any, options: OptionsConfig) {
    if (typeof value !== "string") return false;
    return new LLVariable(value);
  }
  toString(): string {
    return this.value;
  }
}

export class LLColor extends LLNode {
  constructor(private value: Color) {
    super();
  }
  evaluate(env: Environment): ReturnVal<Color> {
    this.evalCheck(env);
    return { result: this.value, env };
  }
  static tryToConstruct(value: any, options: OptionsConfig): false | LLColor {
    if (value instanceof Color) {
      return new LLColor(value);
    }
    if (typeof value === "string" && Color.stringIsColor(value, "lab")) {
      return new LLColor(Color.colorFromString(value, "lab"));
    }
    return false;
  }
  toString(): string {
    return this.value.toHex();
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
  static tryToConstruct(value: any, options: OptionsConfig) {
    if (typeof value !== "number") return false;
    return new LLNumber(value);
  }
  toString(): string {
    return this.value.toString();
  }
}

const LLNumberOpTypes = ["+", "-", "*", "/"] as const;
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
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const opType = LLNumberOpTypes.find((x) => node[x]);
    if (!opType) return false;
    const { left, right } = node[opType];
    if (!checkIfValsPresent(node[opType], ["left", "right"])) return false;
    const leftType = tryTypes([LLValue], options)(left);
    const rightType = tryTypes([LLValue], options)(right);
    if (!leftType || !rightType) return false;
    return new LLNumberOp(opType, leftType, rightType);
  }
  toString(): string {
    return `${this.left.toString()} ${this.type} ${this.right.toString()}`;
  }
}

const predicateTypes = ["==", "!=", ">", "<", "similar"] as const;
export class LLPredicate extends LLNode {
  constructor(
    private type: (typeof predicateTypes)[number],
    private left: LLValue,
    private right: LLValue,
    private similarityThreshold?: number
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    this.evalCheck(env);
    const { left, right } = this;
    let leftEval = left.evaluate(env).result;
    let rightEval = right.evaluate(env).result;
    if (typeof leftEval !== typeof rightEval) {
      throw new Error("predicate - type error ");
    }
    let isColor = leftEval instanceof Color;
    if (isColor && this.type !== "similar") {
      leftEval = leftEval.toHex();
      rightEval = rightEval.toHex();
    }
    switch (this.type) {
      case "similar":
        let thresh = this.similarityThreshold;
        if (!thresh) throw new Error("Similarity threshold not found");
        if (isColor) {
          const diff = leftEval.symmetricDeltaE(rightEval);
          return { result: diff < thresh, env };
        }
        throw new Error("Type error");
      case "==":
        return { result: leftEval === rightEval, env };
      case "!=":
        return { result: leftEval !== rightEval, env };
      case ">":
        return { result: leftEval > rightEval, env };
      case "<":
        return { result: leftEval < rightEval, env };
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const predicateType = predicateTypes.find((x) => node[x]);
    if (!predicateType) return false;
    const { left, right, similarityThreshold } = node[predicateType];
    if (!checkIfValsPresent(node[predicateType], ["left", "right"]))
      return false;
    const leftType = tryTypes([LLValue], options)(left);
    const rightType = tryTypes([LLValue], options)(right);
    if (!leftType || !rightType) return false;
    return new LLPredicate(
      predicateType,
      leftType,
      rightType,
      similarityThreshold
    );
  }
  toString(): string {
    let type = "" + this.type;
    if (this.type === "similar") {
      type = `similar(${this.similarityThreshold})`;
    }
    return `${this.left.toString()} ${type} ${this.right.toString()}`;
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
      | LLReduces
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
      LLReduces,
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
const VFTypes = [
  {
    primaryKey: "cvd_sim",
    params: ["type"] as string[],
    op: (val: Color, params: Params) => cvd_sim(params.type, val),
  },
  {
    primaryKey: "name",
    params: [] as string[],
    op: (val: Color, _params: Params) => getName(val),
  },
  {
    primaryKey: "toColor",
    params: ["space", "channel"] as string[],
    op: (val: Color, params: Params) =>
      val.toColorSpace(params.space as any).getChannel(params.channel),
  },
];

Object.entries(colorPickerConfig).map(([colorSpace, value]) => {
  (["xChannel", "yChannel", "zChannel"] as const).forEach((channel) => {
    const channelKey = value[channel];
    VFTypes.push({
      primaryKey: `${colorSpace}.${channelKey.toLowerCase()}`,
      params: [] as string[],
      op: (val: Color, _params: Params) =>
        val.toColorSpace(colorSpace as any).getChannel(channelKey),
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
    if (!(inputEval instanceof Color)) {
      throw new Error("Type error");
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
    const inputTypes = [LLColor, LLVariable];
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
      const allParamsFound = x.params.every((key) => key in node);
      const noExtraParams = Object.keys(node).every(
        (key) => x.params.includes(key) || key === x.primaryKey
      );
      // console.log(allParamsFound, noExtraParams, x.params, Object.keys(node));
      return allParamsFound && noExtraParams;
    });
const getParams = (op: any, node: any) =>
  op.params.reduce((acc: any, key: any) => ({ ...acc, [key]: node[key] }), {});

const LLPairFunctionTypes = [
  {
    primaryKey: "dist",
    params: ["space"] as string[],
    op: (valA: Color, valB: Color, params: Params) =>
      valA.distance(valB, params.space as any),
  },
  {
    primaryKey: "deltaE",
    params: ["algorithm"] as string[],
    op: (valA: Color, valB: Color, params: Params) =>
      valA.deltaE(valB, params.algorithm as any),
  },
  {
    primaryKey: "contrast",
    params: ["algorithm"] as string[],
    op: (valA: Color, valB: Color, params: Params) =>
      valA.toColorIO().contrast(valB.toColorIO(), params.algorithm as any),
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
export class LLQuantifier extends LLNode {
  constructor(
    private type: (typeof QuantifierTypes)[number],
    private input: LLValueArray | LLVariable,
    private predicate: LLPredicate,
    private varbs: string[],
    private where?: LLPredicate
  ) {
    super();
  }
  evaluate(env: Environment) {
    this.evalCheck(env);
    // weird restoration of type information to make the forward stuff work
    const type = tryTypes([LLValueArray, LLValue], env.options);
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
    if (!quantifierType) return false;
    const { predicate, varb, varbs, where } = node[quantifierType];
    const input = node[quantifierType].in;
    // must have both an input and a predicate
    if (!input || !predicate) return false;
    // must have a variable or variables
    if (!varb && !varbs) return false;

    const inputType = tryTypes([LLValueArray, LLVariable], options)(input);
    const predicateType = tryTypes([LLExpression], options)(predicate);
    if (!inputType || !predicateType) return false;
    return new LLQuantifier(
      quantifierType,
      inputType,
      predicateType,
      varb ? [varb] : varbs,
      where && tryTypes([LLPredicate], options)(where)
    );
  }
  toString(): string {
    let varbs = "";
    if (this.varbs.length > 1) {
      varbs = `(${this.varbs.join(", ")})`;
    } else {
      varbs = this.varbs.join(", ");
    }
    let targ = this.input.toString();
    if (targ !== "colors") {
      targ = `(${targ})`;
    }
    let where = "";
    if (this.where) {
      where = ` WHERE ${this.where.toString()}`;
    }
    // const type = this.type === "exist" ? "∃" : "∀";
    const type = this.type.toUpperCase();
    return `${type} ${varbs} in ${targ}${where}, ${this.predicate.toString()}`;
  }
}

const reduceTypes = ["count", "sum", "min", "max", "mean"] as const;
export class LLReduces extends LLNode {
  constructor(
    private type: (typeof reduceTypes)[number],
    private children: LLValueArray | LLVariable
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<number> {
    this.evalCheck(env);
    const children = this.children.evaluate(env).result;
    if (!Array.isArray(children)) {
      throw new Error("Type error");
    }
    switch (this.type) {
      case "count":
        return { result: children.length, env };
      case "sum":
        return { result: children.reduce((a, b) => a + b, 0), env };
      case "mean":
        return {
          result: children.reduce((a, b) => a + b, 0) / children.length,
          env,
        };
      case "min":
        return { result: Math.min(...children), env };
      case "max":
        return { result: Math.max(...children), env };
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const reduceType = reduceTypes.find((x) => node[x]);
    if (!reduceType) return false;
    const children = node[reduceType];
    if (!children) return false;
    let childType;
    if (Array.isArray(children)) {
      childType = tryTypes([LLValueArray], options)(children);
    } else {
      childType = tryTypes([LLVariable], options)(children);
    }
    if (!childType) return false;
    return new LLReduces(reduceType, childType);
  }
  toString(): string {
    return `${this.type}(${this.children.toString()})`;
  }
}

function parseToAST(root: any, options: OptionsConfig) {
  const node = LLExpression.tryToConstruct(root, options);
  if (!node) throw new Error("Invalid node");
  return node;
}

const DEFAULT_OPTIONS = {
  debugTypeCheck: false,
  debugEval: false,
  stages: false,
};
export function LLEval(
  root: LintProgram,
  palette: Palette,
  options: Partial<typeof DEFAULT_OPTIONS> = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const inputEnv = new Environment(palette, {}, opts, {});
  const ast = parseToAST({ id: [root] }, opts);
  if (options.stages) {
    console.log(ast.toString());
    console.log("EVALUATION EVALUATION EVALUATION EVALUATION");
  }
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
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const ast = parseToAST({ id: [root] }, opts);
  return ast.toString();
}
