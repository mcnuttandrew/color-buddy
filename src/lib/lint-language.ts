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
  colors: Color[];
  variables: Record<string, Value>;
}
type Ret<A> = [A, Environment];
const evaluate = (program: Program, colors: Color[]): boolean =>
  evalExpression(program, { colors, variables: {} })[0];
export default evaluate;
type Evaluator<A> = (expression: A, env: Environment) => Ret<boolean>;
const evalExpression: Evaluator<Expression> = (expression, env) => {
  switch (expression.nodeType) {
    case "Predicate":
      return evalPredicate(expression, env);
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
const evalPredicate: Evaluator<Predicate> = (predicate, env) => {
  const { left, right } = predicate;
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
const evalQuantifier: Evaluator<Quantifier> = (quantifier, env) => {
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
const evalValue: Evaluator<Value> = (value, env: Environment) => [
  value.value,
  env,
];
const evalBool: Evaluator<Bool> = (bool, env) => [bool.value === "True", env];
const evalVariable: Evaluator<Variable> = (variable, env) => [
  env.variables[variable.value],
  env,
];
const evalExists: Evaluator<Quantifier> = (quantifier, env) => {
  const inputEval = evalValue(input, env);
  const predicate = quantifier.predicate;
  const predicateEval = evalPredicate(predicate, env, inputEval, value);
  return [predicateEval, env];
};

const evalForAll: Evaluator<Quantifier> = (_q, env) => {
  throw new Error("not implemented");
  return [false, env];
};
const evalForAllSeq: Evaluator<Quantifier> = (_q, env) => {
  throw new Error("not implemented");
  return [false, env];
};
const evalConditional: Evaluator<Conditional> = (expression, env) => {
  const condition = evalExpression(expression.condition, env);
  const result = evalExpression(
    condition[0] ? expression.then : expression.else,
    env
  );
  return [result, env];
};
