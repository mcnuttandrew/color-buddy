import cvd_sim from "./blindness";
import { Color } from "./Color";
import { getName } from "./lints/name-discrim";

type RawValues = string | number | Color | string[] | number[] | Color[];
class Environment {
  constructor(
    private colors: Color[],
    private variables: Record<string, LLVariable | LLValue | LLValueArray>,
    public options: OptionsConfig
  ) {}
  set(name: string, value: LLVariable | LLValue | LLValueArray) {
    if (name === "colors") {
      throw new Error("Cannot set colors");
    }
    if (this.variables[name]) {
      throw new Error("Variable already exists");
    }
    const newVariables = { ...this.variables, [name]: value };
    return new Environment(this.colors, newVariables, this.options);
  }
  get(name: string) {
    if (name === "colors") {
      const children = this.colors
        .map((x) => new LLColor(x))
        .map((x) => new LLValue(x));
      return new LLValueArray(children);
    }
    const val = this.variables[name];
    if (!val) throw new Error("Variable not found");
    return val;
  }
  copy() {
    return new Environment(this.colors, { ...this.variables }, this.options);
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

type ReturnVal<A> = { result: A; env: Environment };
class LLNode {
  evaluate(env: Environment): ReturnVal<any> {
    this.evalCheck(env);
    throw new Error("Invalid node");
  }
  evalCheck(_env: Environment): void {
    if (_env.options.debugEval) {
      console.log(this.constructor.name, this);
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

class LLExpression extends LLNode {
  constructor(
    private value: LLConjunction | LLPredicate | LLQuantifier | LLBool
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    this.evalCheck(env);
    return { result: this.value.evaluate(env).result, env };
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const value = tryTypes(
      [LLConjunction, LLQuantifier, LLBool, LLPredicate],
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
class LLConjunction extends LLNode {
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
        return {
          result: children.every((x) => x.evaluate(env).result),
          env,
        };
      case "or":
        return { result: children.some((x) => x.evaluate(env).result), env };
      case "not":
        return { result: !children[0].evaluate(env).result, env };
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

class LLValueArray extends LLNode {
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

class LLBool extends LLNode {
  value: "True" | "False";
  constructor(bool: { value: "True" | "False" }) {
    super();
    this.value = bool.value;
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    this.evalCheck(env);
    return { result: this.value === "True", env };
  }
  static tryToConstruct(value: any, options: OptionsConfig) {
    if (value !== "True" && value !== "False") return false;
    return new LLBool({ value });
  }
  toString(): string {
    return this.value;
  }
}

class LLVariable extends LLNode {
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

class LLColor extends LLNode {
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

class LLNumber extends LLNode {
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
class LLNumberOp extends LLNode {
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
    if (!left || !right) return false;
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
class LLPredicate extends LLNode {
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
      // missing similar
      case "similar":
        if (!this.similarityThreshold) {
          throw new Error("Similarity threshold not found");
        }
        if (isColor) {
          const simResult =
            (leftEval as Color).symmetricDeltaE(rightEval) <
            this.similarityThreshold;
          return { result: simResult, env };
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
    if (!left || !right) return false;
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

class LLValue extends LLNode {
  constructor(
    private value:
      | LLValueFunction
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
    return { result: this.value.evaluate(env).result, env };
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const types = [
      LLValueFunction,
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
] as const;

class LLValueFunction extends LLNode {
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
    return { result, env };
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const inputTypes = [LLColor, LLVariable];
    // find the appropriate type and do a simple type check
    const op = VFTypes.find((x) => {
      const pk = node[x.primaryKey];
      if (!pk) return false;
      const allParamsFound = x.params.every((key) => key in node);
      const noExtraParams = Object.keys(node).every(
        (key) => x.params.includes(key) || key === x.primaryKey
      );
      return allParamsFound && noExtraParams;
    });

    if (!op) return false;
    const input = tryTypes(inputTypes, options)(node[op.primaryKey]);
    if (!input) return false;
    const params = op.params.reduce(
      (acc, key) => ({ ...acc, [key]: node[key] }),
      {}
    );
    return new LLValueFunction(op.primaryKey, input, params);
  }
  toString(): string {
    const params = Object.values(this.params).join(", ");
    const paramString = params.length ? `, ${params}` : "";
    return `${this.type}(${this.input.toString()}${paramString})`;
  }
}

const QuantifierTypes = ["exist", "all", "all-seq"] as const;
class LLQuantifier extends LLNode {
  constructor(
    private type: (typeof QuantifierTypes)[number],
    private input: LLValueArray | LLVariable,
    private predicate: LLPredicate,
    private value: string,
    private where?: LLPredicate
  ) {
    super();
  }
  evaluate(env: Environment) {
    this.evalCheck(env);
    // weird restoration of type information to make the forward stuff work
    const type = tryTypes([LLValueArray, LLValue], env.options);
    const where = this.where;
    const inputEval = this.input
      .evaluate(env)
      .result.map((x: any) => type(x))
      .filter((x: any) =>
        where ? where.evaluate(env.set(this.value, x)).result : true
      );

    if (!Array.isArray(inputEval)) {
      throw new Error("Type error");
    }
    const predicateEval = this.predicate;
    // TODO can fold all-seq into all if willing to add indexes into the environment tacitly
    // note: this will need to adjust the where clause to accommodate for the indices
    const evalPred = (x: any) =>
      predicateEval.evaluate(env.set(this.value, x)).result;
    switch (this.type) {
      case "exist":
        const resultExist = inputEval.some(evalPred);
        return { result: resultExist, env };
      case "all":
        const resultAll = inputEval.every(evalPred);
        return { result: resultAll, env };
      case "all-seq":
        throw new Error("not implemented");
    }
  }
  static tryToConstruct(node: any, options: OptionsConfig) {
    const quantifierType = QuantifierTypes.find((x) => node[x]);
    if (!quantifierType) return false;
    const { input, predicate, value, where } = node[quantifierType];
    if (!input || !predicate || !value) return false;
    const inputType = tryTypes([LLValueArray, LLVariable], options)(input);
    const predicateType = tryTypes([LLExpression], options)(predicate);
    if (!inputType || !predicateType) return false;
    let whereType;
    if (where) {
      whereType = tryTypes([LLPredicate], options)(where);
    }
    return new LLQuantifier(
      quantifierType,
      inputType,
      predicateType,
      value,
      whereType
    );
  }
  toString(): string {
    return `${this.type} ${
      this.value
    } in (${this.input.toString()}), ${this.predicate.toString()}`;
  }
}

const reduceTypes = ["count", "sum", "min", "max"] as const;
class LLReduces extends LLNode {
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
export function LLEval(root: any, colors: Color[], options = DEFAULT_OPTIONS) {
  const env = new Environment(colors, {}, DEFAULT_OPTIONS);
  const ast = parseToAST({ id: [root] }, DEFAULT_OPTIONS);
  if (DEFAULT_OPTIONS.stages) {
    console.log(ast.toString());
    console.log("EVALUATION EVALUATION EVALUATION EVALUATION");
  }
  return ast.evaluate(env).result;
}

export function prettyPrintLL(root: any) {
  const ast = parseToAST({ id: [root] }, DEFAULT_OPTIONS);
  return ast.toString();
}
