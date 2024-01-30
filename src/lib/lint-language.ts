import cvd_sim from "./blindness";
import { Color } from "./Color";
import { getName } from "./lints/name-discrim";

type RawValues = string | number | Color | RawValues[];
class Environment {
  constructor(
    private colors: Color[],
    private variables: Record<string, LLVariable | LLValue | LLValueArray> // private variables: Record<string, RawValues>
  ) {}
  set(name: string, value: LLVariable | LLValue | LLValueArray) {
    // set(name: string, value: RawValues) {
    if (name === "colors") {
      throw new Error("Cannot set colors");
    }
    const newVariables = { ...this.variables, [name]: value };
    return new Environment(this.colors, newVariables);
  }
  get(name: string) {
    if (name === "colors") {
      const children = this.colors
        .map((x) => new LLColor(x))
        .map((x) => new LLValue(x));
      return new LLValueArray(children);
      // return this.colors;
    }
    const val = this.variables[name];
    if (!val) throw new Error("Variable not found");
    return val;
  }
  copy() {
    return new Environment(this.colors, { ...this.variables });
  }
}

const tryTypes =
  (nodeClasses: any[], options: { debug: boolean }) => (node: any) => {
    for (let i = 0; i < nodeClasses.length; i++) {
      const nodeClass = nodeClasses[i];
      if (options.debug) {
        console.log(options.debug);
        console.log(nodeClass.name, node);
      }
      const result = nodeClass.tryToConstruct(node, options);
      if (result) return result;
    }
    return false;
  };

type ReturnVal<A> = { result: A; env: Environment };
class LLNode {
  evaluate(_env: Environment): ReturnVal<any> {
    throw new Error("Invalid node");
  }
  static tryToConstruct(
    node: any,
    options: { debug: boolean }
  ): false | LLNode {
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
    return { result: this.value.evaluate(env).result, env };
  }
  static tryToConstruct(node: any, options: { debug: boolean }) {
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
  static tryToConstruct(node: any, options: { debug: boolean }) {
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
    const result = this.children.map((x) => x.evaluate(env).result);
    return { result, env };
  }
  static tryToConstruct(children: any, options: { debug: boolean }) {
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
    return { result: this.value === "True", env };
  }
  static tryToConstruct(value: any, options: { debug: boolean }) {
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
  evaluate(env: Environment) {
    const varDeRef = env.get(this.value);
    return varDeRef.evaluate(env);
  }
  static tryToConstruct(value: any, options: { debug: boolean }) {
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
    return { result: this.value, env };
  }
  static tryToConstruct(
    value: any,
    options: { debug: boolean }
  ): false | LLColor {
    if (value instanceof Color) {
      return new LLColor(value);
    }
    if (Color.stringIsColor(value, "lab")) {
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
    return { result: this.value, env };
  }
  static tryToConstruct(value: any, options: { debug: boolean }) {
    if (typeof value !== "number") return false;
    return new LLNumber(value);
  }
  toString(): string {
    return this.value.toString();
  }
}

const predicateTypes = ["==", "!=", ">", "<"] as const;
class LLPredicate extends LLNode {
  constructor(
    private type: (typeof predicateTypes)[number],
    private left: LLValue,
    private right: LLValue
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    const { left, right } = this;
    let leftEval = left.evaluate(env).result;
    let rightEval = right.evaluate(env).result;
    if (typeof leftEval !== typeof rightEval) {
      throw new Error("predicate - type error ");
    }
    let isColor = leftEval instanceof Color;
    if (isColor) {
      leftEval = leftEval.toString();
      rightEval = rightEval.toString();
    }
    switch (this.type) {
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
  static tryToConstruct(node: any, options: { debug: boolean }) {
    // throw new Error("test");
    const predicateType = predicateTypes.find((x) => node[x]);
    if (!predicateType) return false;
    const { left, right } = node[predicateType];
    if (!left || !right) return false;
    const leftType = tryTypes([LLValue], options)(left);
    const rightType = tryTypes([LLValue], options)(right);
    if (!leftType || !rightType) return false;
    return new LLPredicate(predicateType, leftType, rightType);
  }
  toString(): string {
    return `${this.left.toString()} ${this.type} ${this.right.toString()}`;
  }
}

class LLValue extends LLNode {
  constructor(
    private value: LLValueFunction | LLColor | LLNumber | LLVariable | LLReduces
  ) {
    super();
  }
  evaluate(env: Environment) {
    return { result: this.value.evaluate(env).result, env };
  }
  static tryToConstruct(node: any, options: { debug: boolean }) {
    const types = [LLValueFunction, LLColor, LLNumber, LLVariable, LLReduces];
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
    primaryKey: "colorSpaceChanel",
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
  static tryToConstruct(node: any, options: { debug: boolean }) {
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
    private value: string
  ) {
    super();
  }
  evaluate(env: Environment) {
    // weird restoration of type information
    const inputEval = this.input.evaluate(env).result.map((x) => {
      return tryTypes([LLValueArray, LLValue], {
        debug: false,
      })(x);
    });
    if (!Array.isArray(inputEval)) {
      throw new Error("Type error");
    }
    const predicateEval = this.predicate;
    // TODO can fold all-seq into all if willing to add indexes into the environment tacitly
    const evalPred = (x) =>
      predicateEval.evaluate(env.set(this.value, x)).result;
    switch (this.type) {
      case "exist":
        return { result: inputEval.some(evalPred), env };
      case "all":
        return { result: inputEval.every(evalPred), env };
      case "all-seq":
        throw new Error("not implemented");
    }
  }
  static tryToConstruct(node: any, options: { debug: boolean }) {
    const quantifierType = QuantifierTypes.find((x) => node[x]);
    if (!quantifierType) return false;
    const { input, predicate, value } = node[quantifierType];
    if (!input || !predicate || !value) return false;
    const inputType = tryTypes([LLValueArray, LLVariable], options)(input);
    const predicateType = tryTypes([LLExpression], options)(predicate);
    if (!inputType || !predicateType) return false;
    return new LLQuantifier(quantifierType, inputType, predicateType, value);
  }
  toString(): string {
    return `${this.type} ${
      this.value
    } in (${this.input.toString()}), ${this.predicate.toString()}`;
  }
}

const reduceTypes = [
  "count",
  "sum",
  "min",
  "max",
  //   "median",
  //   "mode",
  "std",
] as const;
class LLReduces extends LLNode {
  constructor(
    private type: (typeof reduceTypes)[number],
    private children: LLValueArray | LLVariable
  ) {
    super();
  }
  evaluate(env: Environment): ReturnVal<number> {
    const children = this.children.evaluate(env).result;
    if (!Array.isArray(children)) {
      throw new Error("Type error");
    }
    // const childrenEval = children.map((x) => x.evaluate(env).result);

    switch (this.type) {
      case "count":
        return { result: children.length, env };
      case "sum":
        return { result: children.reduce((a, b) => a + b, 0), env };
      case "min":
        return { result: Math.min(...children), env };
      case "max":
        return { result: Math.max(...children), env };
      case "std":
        return { result: 0, env };
    }
  }
  static tryToConstruct(node: any, options: { debug: boolean }) {
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

function parseToAST(root: any) {
  const node = LLExpression.tryToConstruct(root, { debug: false });
  if (!node) throw new Error("Invalid node");
  return node;
}

export function LLEval(root: any, colors: Color[]) {
  const env = new Environment(colors, {});
  const ast = parseToAST({ id: [root] });
  console.log(ast.toString());
  console.log("EVALUATION EVALUATION EVALUATION EVALUATION");
  return ast.evaluate(env).result;
}

export function prettyPrintLL(root: any) {
  const ast = parseToAST({ id: [root] });
  return ast.toString();
}
