import cvd_sim from "./blindness";
// assuming everything is hex strings for now
type Color = string;

class Environment {
  constructor(
    public colors: Color[],
    public variables: Record<string, LLValue | LLValueArray>
  ) {}
  set(name: string, value: LLValue) {
    if (name === "colors") {
      throw new Error("Cannot set colors");
    }
    const newVariables = { ...this.variables, [name]: value };
    return new Environment(this.colors, newVariables);
  }
  get(name: string) {
    if (name === "colors") {
      const children = this.colors.map((x) => new LLColor({ value: x }));
      return new LLValueArray({ children });
    }
    return this.variables[name];
  }
  copy() {
    return new Environment(this.colors, { ...this.variables });
  }
}

const tryTypes = (nodeClasses: any[]) => (node: any) => {
  const nodeClass = nodeClasses.find((x) => x.tryToConstruct(node));
  //   if (!nodeClass) throw new Error("Invalid node", node);
  if (!nodeClass) return false;
  return nodeClass.tryToConstruct(node);
};

type ReturnVal<A> = { result: A; env: Environment };
class LLNode {
  evaluate(env: Environment): ReturnVal<any> {
    throw new Error("Invalid node");
  }
  static tryToConstruct(node: any): false | LLNode {
    console.log(this.name, node);
    throw new Error("Invalid node", node);
    return false;
  }
  toString() {
    return "Node";
  }
}

class LLExpression extends LLNode {
  value: LLConjunction | LLPredicate | LLQuantifier | LLBool;
  constructor(value: LLConjunction | LLPredicate | LLQuantifier | LLBool) {
    super();
    this.value = value;
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    return { result: this.value.evaluate(env).result, env };
  }
  static tryToConstruct(node: any): false | LLNode {
    console.log(this.name, node);
    const value = tryTypes([LLConjunction, LLPredicate, LLQuantifier, LLBool])(
      node
    );
    if (!value) return false;
    return new LLExpression(value);
  }
  toString(): string {
    return this.value.toString();
  }
}

const ConjunctionTypes = ["and", "or", "not", "none", "id"] as const;
class LLConjunction extends LLNode {
  type: (typeof ConjunctionTypes)[number] = "and";
  children: LLConjunction[];
  constructor(expr: {
    type: (typeof ConjunctionTypes)[number];
    children: LLConjunction[];
  }) {
    super();
    this.type = expr.type;
    this.children = expr.children;
  }

  evaluate(env: Environment): ReturnVal<boolean> {
    // throw new Error("Method not implemented.");
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
  static tryToConstruct(node: any): false | LLNode {
    console.log(this.name, node);
    const exprType = ConjunctionTypes.find((x) => node[x]);
    if (!exprType) return false;
    const children = node[exprType];
    if (!children) return false;
    const cleanedChildren = Array.isArray(children) ? children : [children];
    const childrenTypes = cleanedChildren.map(tryTypes([LLExpression]));
    if (childrenTypes.some((x) => x === false)) return false;
    return new LLConjunction({ type: exprType, children: childrenTypes });
  }
  toString(): string {
    if (this.type === "id") return this.children[0].toString();
    if (this.type === "none") return "";
    if (this.type === "not") return `NOT ${this.children[0].toString()}`;
    return this.children.map((x) => x.toString()).join(` ${this.type} `);
  }
}

class LLValueArray extends LLNode {
  children: LLValue[];
  constructor(array: { children: LLValue[] }) {
    super();
    this.children = array.children;
  }
  evaluate(env: Environment): ReturnVal<LLValue[]> {
    return { result: this.children.map((x) => x.evaluate(env).result), env };
  }
  static tryToConstruct(children: any): false | LLNode {
    console.log(this.name, children);
    if (!children || !Array.isArray(children)) return false;
    const childrenTypes = children.map(tryTypes([LLValue]));
    if (childrenTypes.some((x) => x === false)) return false;
    return new LLValueArray({ children: childrenTypes });
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
  static tryToConstruct(value: any): false | LLNode {
    console.log(this.name, value);
    if (value !== "True" && value !== "False") return false;
    return new LLBool({ value });
  }
  toString(): string {
    return this.value;
  }
}

class LLVariable extends LLNode {
  value: string;
  constructor(variable: { value: string }) {
    super();
    this.value = variable.value;
  }
  evaluate(env: Environment): ReturnVal<LLValue | LLValueArray | LLValue[]> {
    console.log(this.name, this.value, env.variables);

    const varDefRef = env.get(this.value);
    // if its a variable reference, return the value
    if (varDefRef instanceof LLVariable || varDefRef instanceof LLValueArray) {
      return varDefRef.evaluate(env);
    }
    return { result: varDefRef, env };
  }
  static tryToConstruct(value: any): false | LLNode {
    console.log(this.name, value);
    if (typeof value !== "string") return false;
    return new LLVariable({ value });
  }
  toString(): string {
    return this.value;
  }
}

class LLColor extends LLNode {
  value: string;
  constructor(color: { value: string }) {
    super();
    this.value = color.value;
  }
  evaluate(env: Environment): ReturnVal<string> {
    return { result: this.value, env };
  }
  static tryToConstruct(value: any): false | LLColor {
    console.log(this.name, value);
    if (typeof value !== "string") return false;
    return new LLColor({ value });
  }
  toString(): string {
    return this.value;
  }
}

class LLNumber extends LLNode {
  value: number;
  constructor(number: { value: number }) {
    super();
    this.value = number.value;
  }
  evaluate(env: Environment): ReturnVal<number> {
    return { result: this.value, env };
  }
  static tryToConstruct(value: any): false | LLNode {
    console.log(this.name, value);
    if (typeof value !== "number") return false;
    return new LLNumber({ value });
  }
  toString(): string {
    return this.value.toString();
  }
}

const predicateTypes = ["==", "!=", ">", "<"] as const;
class LLPredicate extends LLNode {
  type: (typeof predicateTypes)[number];
  left: LLValue;
  right: LLValue;
  constructor(predicate: {
    type: (typeof predicateTypes)[number];
    left: LLValue;
    right: LLValue;
  }) {
    super();
    this.type = predicate.type;
    this.left = predicate.left;
    this.right = predicate.right;
  }
  evaluate(env: Environment): ReturnVal<boolean> {
    const { left, right } = this;
    const leftEval = left.evaluate(env).result;
    const rightEval = right.evaluate(env).result;
    switch (this.type) {
      // todo missing similar to
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
  static tryToConstruct(node: any): false | LLNode {
    console.log(this.name, node);
    const predicateType = predicateTypes.find((x) => node[x]);
    if (!predicateType) return false;
    const { left, right } = node[predicateType];
    if (!left || !right) return false;
    const leftType = tryTypes([LLValue])(left);
    const rightType = tryTypes([LLValue])(right);
    if (!leftType || !rightType) return false;
    return new LLPredicate({
      type: predicateType,
      left: leftType,
      right: rightType,
    });
  }
  toString(): string {
    return `${this.left.toString()} ${this.type} ${this.right.toString()}`;
  }
}

class LLValue extends LLNode {
  value: LLColor | LLNumber | LLVariable | LLValueFunction;
  constructor(value: LLColor | LLNumber | LLVariable | LLValueFunction) {
    super();
    this.value = value;
  }
  evaluate(env: Environment): ReturnVal<LLValue> {
    return { result: this.value.evaluate(env).result, env };
  }
  static tryToConstruct(node: any): false | LLNode {
    console.log(this.name, node);
    const value = tryTypes([
      LLColor,
      LLNumber,
      LLVariable,
      LLReduces,
      LLValueFunction,
    ])(node);
    if (!value) return false;
    return new LLValue(value);
  }
  toString(): string {
    return this.value.toString();
  }
}

class LLValueFunction extends LLNode {
  type: "cvd_sim" | "name" | "colorSpaceChanel";
  input: LLColor | LLVariable;
  params: Record<string, string>;
  constructor(value: {
    type: "cvd_sim" | "name" | "colorSpaceChanel";
    input: LLColor | LLVariable;
    params: Record<string, string>;
  }) {
    super();
    this.type = value.type;
    this.input = value.input;
    this.params = value.params;
  }
  evaluate(env: Environment): ReturnVal<string> {
    const { input, params } = this;
    const inputEval = input.evaluate(env).result;
    switch (this.type) {
      case "cvd_sim":
        const simResult = cvd_sim(params.cvd_type, inputEval.value).toHex();
        return { result: simResult, env };
      case "name":
        return { result: inputEval, env };
      case "colorSpaceChanel":
        return { result: inputEval, env };
    }
  }
  static tryToConstruct(node: any): false | LLNode {
    if (node.cvd_sim) {
      const input = tryTypes([LLColor, LLVariable])(node.cvd_sim);
      const cvd_type = node.type;
      if (!input) return false;
      if (!cvd_type) throw new Error("Missing type", node);
      return new LLValueFunction({
        type: "cvd_sim",
        input,
        params: { cvd_type },
      });
    }
    throw new Error("Not implemented");
    // return false;
    // console.log(this.name, node);

    // const value = tryTypes([LLColor, LLVariable])(node);
    // if (!value) return false;
    // return new LLValueFunction(value);
  }
  toString(): string {
    return `${this.type}(${this.input.toString()})`;
  }
}

const QuantifierTypes = ["exists", "all", "all-seq"] as const;
class LLQuantifier extends LLNode {
  type: (typeof QuantifierTypes)[number];
  input: LLValueArray | LLVariable;
  predicate: LLPredicate;
  value: string;
  constructor(quantifier: {
    type: (typeof QuantifierTypes)[number];
    input: LLValueArray | LLVariable;
    predicate: LLPredicate;
    value: string;
  }) {
    super();
    this.type = quantifier.type;
    this.input = quantifier.input;
    this.predicate = quantifier.predicate;
    this.value = quantifier.value;
  }
  evaluate(env: Environment) {
    const inputEval = this.input.evaluate(env).result;
    if (!(inputEval instanceof LLValueArray)) {
      throw new Error("Type error");
    }
    const predicateEval = this.predicate;
    const evalPred = (x: LLValue) =>
      predicateEval.evaluate(env.set(this.value, x)).result;
    // .evaluate(env);
    switch (this.type) {
      case "exists":
        return { result: inputEval.children.some(evalPred), env };
      case "all":
        return { result: inputEval.children.every(evalPred), env };
      case "all-seq":
        throw new Error("not implemented");
    }
  }
  static tryToConstruct(node: any): false | LLNode {
    console.log(this.name, node);
    const quantifierType = QuantifierTypes.find((x) => node[x]);
    if (!quantifierType) return false;
    const { input, predicate, value } = node[quantifierType];
    if (!input || !predicate || !value) return false;
    const inputType = tryTypes([LLValueArray, LLVariable])(input);
    const predicateType = tryTypes([LLExpression])(predicate);
    if (!inputType || !predicateType) return false;
    return new LLQuantifier({
      type: quantifierType,
      input: inputType,
      predicate: predicateType,
      value,
    });
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
  type: (typeof reduceTypes)[number];
  children: LLValueArray | LLVariable;
  constructor(reduces: {
    type: (typeof reduceTypes)[number];
    children: LLValueArray | LLVariable;
  }) {
    super();
    this.type = reduces.type;
    this.children = reduces.children;
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
  static tryToConstruct(node: any): false | LLNode {
    console.log(this.name, node);
    const reduceType = reduceTypes.find((x) => node[x]);
    if (!reduceType) return false;
    const children = node[reduceType];
    if (!children) return false;
    let childType;
    if (Array.isArray(children)) {
      childType = tryTypes([LLValueArray])(children);
    } else {
      childType = tryTypes([LLVariable])(children);
    }
    if (!childType) return false;
    return new LLReduces({ type: reduceType, children: childType });
  }
  toString(): string {
    return `${this.type}(${this.children.toString()})`;
  }
}

function parseToAST(root: any) {
  const node = LLExpression.tryToConstruct(root);
  if (!node) throw new Error("Invalid node");
  return node;
}

export function LLEval(root: any, colors: Color[]) {
  const env = new Environment(colors, {});
  const ast = parseToAST({ id: [root] });
  return ast.evaluate(env).result;
}

export function prettyPrintLL(root: any) {
  const ast = parseToAST({ id: [root] });
  return ast.toString();
}
