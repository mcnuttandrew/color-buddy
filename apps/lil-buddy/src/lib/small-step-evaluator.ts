import { LLTypes, linter, Environment } from "color-buddy-palette-lint";
import { Color } from "color-buddy-palette";
import type { Palette } from "color-buddy-palette";

import { makePalFromString } from "color-buddy-palette";

type LLNode = InstanceType<(typeof LLTypes)["LLNode"]>;
export type InducedVariables = Record<string, Color | number>;

export function rewriteQuantifiers(node: any) {
  if (!node || !node.nodeType) {
    return node;
  }
  const newNode = node.copy();
  switch (node.nodeType) {
    case "pairFunction":
    case "numberOp":
    case "predicate":
      const left = rewriteQuantifiers(newNode.left);
      const right = rewriteQuantifiers(newNode.right);
      newNode.left = left;
      newNode.right = right;
      break;
    case "aggregate":
    case "array":
    case "map":
      const children = node.children;
      if (Array.isArray(children)) {
        newNode.children = children.map(rewriteQuantifiers);
      } else {
        newNode.children = rewriteQuantifiers(children);
      }
      break;
    case "node":
    case "expression":
      newNode.value = rewriteQuantifiers(node.value);
      break;
    case "valueFunction":
      newNode.input = rewriteQuantifiers(node.input);
      break;
    case "quantifier":
      if (node.varbs.length === 1) {
        newNode.where = rewriteQuantifiers(node.where);
        newNode.predicate = rewriteQuantifiers(node.predicate);
      } else {
        const [head, ...tail] = node.varbs;
        const newSubNode = node.copy();
        newSubNode.where = rewriteQuantifiers(node.where);
        newSubNode.predicate = node.predicate;
        newSubNode.varbs = tail;
        newNode.where = undefined;
        newNode.varbs = [head];
        newNode.predicate = rewriteQuantifiers(newSubNode);
      }
      break;
    case "bool":
    case "color":
    case "number":
    case "value":
    case "variable":
    default:
      break;
  }
  return newNode;
}

function checkWhere(
  node: any,
  color: Color,
  varb: string,
  pal: Palette,
  inducedVariables: InducedVariables,
  index: number
): boolean {
  if (!node) return true;
  const result = evaluateNode(
    node,
    { ...inducedVariables, [varb]: color, [`index(${varb})`]: index },
    pal
  );
  return result.result;
}

function getValues(node: any, pal: Palette) {
  if (node?.input?.value === "colors") {
    return [...pal.colors];
  }
  if (
    Array.isArray(node?.input?.children) &&
    typeof node.input.children?.at(0)?.constructorString
  ) {
    return makePalFromString(
      node.input.children.map((x: any) => x.constructorString)
    ).colors;
  }

  return [];
}

const toVal = (x: Color | number) => {
  if (typeof x === "number") {
    return new LLTypes.LLValue(new LLTypes.LLNumber(x));
  } else if (typeof x === "string") {
    return new LLTypes.LLValue(
      new LLTypes.LLColor(Color.colorFromHex(x, "lab"), x)
    );
  }
  return new LLTypes.LLValue(new LLTypes.LLColor(x, x.toHex()));
};
function evaluateNode(
  node: any,
  inducedVariables: InducedVariables,
  pal: Palette
) {
  const opts = { debugParse: false, debugEval: false, debugCompare: false };

  const newEnv = Object.entries(inducedVariables).reduce(
    (acc, [key, value]) => acc.set(key, toVal(value)),
    new Environment(pal, {}, opts, {})
  );
  const result = node.evaluate(newEnv);
  return result;
}

function isValue(node: any) {
  switch (node.nodeType) {
    case "value":
      return true;
    case "expression":
    case "node":
      return isValue(node.value);
    case "bool":
    case "color":
    case "number":
    case "variable":
    case undefined:
      return true;
    case "array":
      return node.children.every(isValue);
    default:
      return false;
  }
}

function subTreeIsPureOp(
  node: any,
  inducedVariables: InducedVariables
): boolean {
  node.inducedVariables = toHexes(inducedVariables);
  switch (node.nodeType) {
    case "pairFunction":
    case "numberOp":
    case "predicate":
      return isValue(node.left) && isValue(node.right);
    case "aggregate":
    case "array":
    case "map":
      // special thing for conjunction
      // todo: maybe not necessary, check when the tests work again
      if (node.type === "not") {
        return isValue(node.children[0]);
      }
      if (node.children?.nodeType === "variable") {
        return true;
      }
      const children = node.children;
      if (Array.isArray(children)) {
        return children.every((x: any) => isValue(x));
      } else {
        // for variables and such
        return isValue(children);
      }
    case "node":
    case "expression":
      return subTreeIsPureOp(node.value, inducedVariables);
    case "bool":
    case "color":
    case "number":
    case "value":
    case "variable":
      return false;
    case "valueFunction":
      return isValue(node.input);
    case "quantifier":
      return false;
    // throw new Error("Quantifiers should not be evaluated here", node);
    default:
      return false;
  }
}

function mapObject(obj: any, fn: (k: string, v: any) => any) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(k, v)]));
}
function toHexes(obj: any) {
  return mapObject(obj, (k, v) => {
    if (typeof v === "number") {
      return v;
    }
    if (!v.toHex) {
      return v;
    }
    return v.toHex();
  });
}

let counter = 0;
function traverseAndMaybeExecute(
  node: any,
  inducedVariables: InducedVariables,
  pal: Palette
): {
  result: any;
  didEval: boolean;
} {
  counter++;
  if (counter > 500) {
    throw new Error("Too many iterations");
  }
  const thisIsPureOp = subTreeIsPureOp(node, inducedVariables);
  const allChildrenPureOps = Array.isArray(node?.children)
    ? (node?.children || []).every((x: any) => isValue(x))
    : false;
  if (thisIsPureOp || allChildrenPureOps) {
    const result = evaluateNode(node, inducedVariables, pal).result;
    let astResult;
    if (Array.isArray(result)) {
      astResult = LLTypes.LLValueArray.tryToConstruct(result, {} as any);
    } else {
      astResult = LLTypes.LLValue.tryToConstruct(result, {} as any);
    }
    return { result: astResult, didEval: true };
  }

  let updatedNode = node.copy();
  subTreeIsPureOp(updatedNode, inducedVariables);
  updatedNode.inducedVariables = toHexes({ ...inducedVariables });

  switch (node.nodeType) {
    case "pairFunction":
    case "numberOp":
    case "predicate":
      const leftTraverse = traverseAndMaybeExecute(
        updatedNode.left,
        inducedVariables,
        pal
      );
      if (leftTraverse.didEval) {
        updatedNode.left = leftTraverse.result;
        return { result: updatedNode, didEval: true };
      }
      const rightTraverse = traverseAndMaybeExecute(
        updatedNode.right,
        inducedVariables,
        pal
      );
      if (rightTraverse.didEval) {
        updatedNode.right = rightTraverse.result;
        return { result: updatedNode, didEval: true };
      }
      return { result: updatedNode, didEval: false };
    case "conjunction":
    case "array":
    case "aggregate":
    case "map":
      const children = updatedNode.children;
      if (Array.isArray(children)) {
        const newChildren = [];
        let found = false;
        for (let idx = 0; idx < children.length; idx++) {
          if (found) {
            newChildren.push(children[idx]);
            continue;
          }
          const child = children[idx];
          const childResult = traverseAndMaybeExecute(
            child,
            inducedVariables,
            pal
          );
          newChildren.push(childResult.result);
          found = childResult.didEval;
        }
        updatedNode.children = newChildren;
        return { result: updatedNode, didEval: found };
      } else {
        const childResult = traverseAndMaybeExecute(
          children,
          inducedVariables,
          pal
        );
        updatedNode.children = childResult.result;
        return { result: updatedNode, didEval: childResult.didEval };
      }
    case "node":
    case "expression":
      return traverseAndMaybeExecute(node.value, inducedVariables, pal);
    case "bool":
    case "color":
    case "number":
    case "value":
    case undefined:
      return { result: updatedNode, didEval: false };
    case "variable":
      return { result: updatedNode, didEval: false };
    case "valueFunction":
      const arg = traverseAndMaybeExecute(
        updatedNode.input,
        inducedVariables,
        pal
      );
      if (arg.didEval) {
        updatedNode.input = arg.result;
        return { result: updatedNode, didEval: true };
      } else {
        return { result: updatedNode, didEval: false };
      }

    case "quantifier":
      const values = getValues(updatedNode, pal);
      // const results = [];
      const results = values.map((color, i) => {
        const whereResult = checkWhere(
          updatedNode.where,
          color,
          updatedNode.varbs[0],
          pal,
          { ...updatedNode.inducedVariables },
          i
        );
        if (!whereResult) {
          return { result: "WHERE SKIP", didEval: true, color: color.toHex() };
        }
        const updatedVariables = {
          ...updatedNode.inducedVariables,
          [updatedNode.varbs[0]]: color,
          [`index(${node.varbs[0]})`]: i,
        };
        const evals = generateEvaluations(
          updatedNode.predicate.value || updatedNode.predicate,
          { ...updatedVariables },
          pal
        );
        return {
          color: color.toHex(),
          evals: [...evals],
        };
      });
      return {
        result: {
          results,
          quant: updatedNode.type,
          varb: updatedNode.varbs[0],
        },
        didEval: true,
      };

    default:
      console.log(node.nodeType, " not implemented yet", node);
      throw new Error(`${node.nodeType} not implemented yet`, node);
    // return { result: node, didEval: false };
  }
}

export function generateEvaluations(
  node: LLNode,
  inducedVariables: InducedVariables,
  pal: Palette,
  init?: boolean
): LLNode[] {
  if (init) {
    counter = 0;
  }
  let nodeCopy = node.copy();
  // weird hack to inset the induced variables over everything
  subTreeIsPureOp(nodeCopy, inducedVariables);
  // todo maybe: if this is a quantifier don't copy it
  // const evalLog = node.nodeType === "quantifier" ? [] : [nodeCopy];
  const evalLog = [nodeCopy];
  let currentNode = node.copy();
  subTreeIsPureOp(node, inducedVariables);

  while (
    !subTreeIsPureOp(currentNode, { ...inducedVariables }) &&
    !isValue(currentNode)
  ) {
    const result = traverseAndMaybeExecute(
      currentNode,
      { ...inducedVariables },
      pal
    );
    result.result.inducedVariables = toHexes({ ...inducedVariables });

    evalLog.push(result.result);
    currentNode = result.result;
  }
  // get the final result
  const result = evaluateNode(node, { ...inducedVariables }, pal).result;
  const astResult = LLTypes.LLValue.tryToConstruct(result, {} as any);
  evalLog.push(astResult);
  return evalLog;
}
