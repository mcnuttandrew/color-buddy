type Program = Expression;
type Expression =
  | Predicate
  | Quantifier
  | Bool
  | Conditional
  | {
      nodeType: "Expression";
      type: "AND" | "OR" | "NOT";
      children: Expression[];
    };
interface Conditional {
  nodeType: "Conditional";
  condition: Expression;
  then: Expression;
  else: Expression;
}
type Value =
  | Name
  | Variable
  | Color
  | LLNumber
  | LLMap
  | Reduce
  | PairFunction
  | ValueFunction;
type Bool = { nodeType: "Bool"; value: "True" | "False" };
type Variable = { nodeType: "Variable"; value: string };
type Color = { nodeType: "Color"; value: string };
type LLNumber = { nodeType: "LLNumber"; value: number };
type Name = { nodeType: "Name"; value: string };
interface Predicate {
  nodeType: "Predicate";
  type: "eq" | "neq" | "gt" | "lt" | "gte" | "lte";
  left: Value;
  right: Value;
}
interface Quantifier {
  nodeType: "Quantifier";
  type: "exists" | "forall" | "forall-seq";
  input: Value;
  predicate: Predicate;
  value: Variable;
}

interface LLMap {
  nodeType: "LLMap";
  type: "filter" | "map" | "reduce";
  input: Value;
  function: ValueFunction;
}
interface Reduce {
  nodeType: "Reduce";
  type: "count" | "sum" | "min" | "max" | "unique";
  input: Value;
  function: ValueFunction;
}
interface PairFunction {
  nodeType: "PairFunction";
  type: "contrast" | "deltaE";
  left: Value;
  right: Value;
}
type ValueFunction =
  | {
      nodeType: "ValueFunction";
      type: "channel";
      space: "string";
      input: Color;
    }
  | {
      nodeType: "ValueFunction";
      type: "name" | "name";
      input: Value;
    };

interface Environment {
  colors: any[];
  variables: Record<string, Value>;
}
type Ret<A> = [A, Environment];
const evaluate = (program: Program, colors: Color[]): boolean =>
  evalExpression(program, { colors })[0];
const evalExpression = (
  expression: Expression,
  env: Environment
): Ret<boolean> => {
  switch (expression.nodeType) {
    case "Predicate": {
      return evalPredicate(expression, env, expression.left, expression.right);
    }
    case "Conditional":
      return evalConditional(expression, env);
    case "Quantifier":
      return evalQuantifier(expression, env);
    case "Bool":
      return evalBool(expression, env);
    case "Expression":
      const children = expression.children;
      switch (expression.type) {
        case "AND":
          return [children.every((x) => evalExpression(x, env)), env];
        case "OR":
          return [children.some((x) => evalExpression(x, env)), env];
        case "NOT":
          return [!evalExpression(children[0], env), env];
      }
  }
};
const evalPredicate = (
  predicate: Predicate,
  env: Environment,
  left: Value,
  right: Value
): Ret<boolean> => {
  switch (predicate.type) {
    // todo missing similar to
    case "eq":
      return [evalValue(left, env) === evalValue(right, env), env];
    case "neq":
      return [evalValue(left, env) !== evalValue(right, env), env];
    case "gt":
      return [evalValue(left, env) > evalValue(right, env), env];
    case "lt":
      return [evalValue(left, env) < evalValue(right, env), env];
    case "gte":
      return [evalValue(left, env) >= evalValue(right, env), env];
    case "lte":
      return [evalValue(left, env) <= evalValue(right, env), env];
  }
};
const evalQuantifier = (
  quantifier: Quantifier,
  env: Environment
): Ret<boolean> => {
  switch (quantifier.type) {
    case "exists":
      return evalExists(quantifier, env);
    case "forall":
      return evalForAll(quantifier, env);
    case "forall-seq":
      return evalForAllSeq(quantifier, env);
  }
};
// this is wrong circle back
const evalValue = (value: Value, env: Environment): Value => value;
const evalBool = (bool: Bool, env: Environment): Ret<boolean> => [
  bool === "True",
  env,
];
const evalVariable = (variable: Variable, env: Environment): Value => {
  return env.variables[variable];
};
const evalExists: typeof evalQuantifier = (quantifier, env) => {
  const inputEval = evalValue(input, env);
  const predicateEval = evalPredicate(predicate, env, inputEval, value);
  return predicateEval;
};

const evalForAll: typeof evalQuantifier = (_quantifier, env) => {
  throw new Error("not implemented");
  return [false, env];
};
const evalForAllSeq: typeof evalQuantifier = (_quantifier, env) => {
  throw new Error("not implemented");
  return [false, env];
};
const evalConditional = (expression: Conditional, env: Environment) => {
  const condition = evalExpression(expression.condition, env);
  const result = evalExpression(
    condition[0] ? expression.then : expression.else,
    env
  );
  return [result, env];
};
