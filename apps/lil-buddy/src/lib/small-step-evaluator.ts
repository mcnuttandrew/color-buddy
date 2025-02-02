import { LLTypes, linter, Environment } from "color-buddy-palette-lint";
import { Color } from "color-buddy-palette";
import type { Palette } from "color-buddy-palette";
type LLNode = InstanceType<(typeof LLTypes)["LLNode"]>;

export function evaluateNode(
  node: any,
  inducedVariables: Record<string, Color>,
  pal: Palette
) {
  const opts = { debugParse: false, debugEval: false, debugCompare: false };
  const toVal = (x: Color) =>
    new LLTypes.LLValue(new LLTypes.LLColor(x, x.toHex()));
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
function subTreeIsPureOp(node: any): boolean {
  switch (node.nodeType) {
    case "pairFunction":
    case "numberOp":
    case "predicate":
      return isValue(node.left) && isValue(node.right);
    case "aggregate":
    case "array":
    case "map":
      // special thing for conjunction
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
      return subTreeIsPureOp(node.value);
    case "bool":
    case "color":
    case "number":
    case "value":
    case "variable":
      return false;
    case "valueFunction":
      return isValue(node.input);
    case "quantifier":
      throw new Error("Quantifiers should not be evaluated here", node);
    default:
      return false;
  }
}

let counter = 0;
function traverseAndMaybeExecute(
  node: any,
  inducedVariables: Record<string, Color>,
  pal: Palette
): {
  result: any;
  didEval: boolean;
} {
  counter++;
  if (counter > 500) {
    throw new Error("Too many iterations");
  }
  const thisIsPureOp = subTreeIsPureOp(node);
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
  switch (node.nodeType) {
    case "pairFunction":
    case "numberOp":
    case "predicate":
      const leftTraverse = traverseAndMaybeExecute(
        node.left,
        inducedVariables,
        pal
      );
      if (leftTraverse.didEval) {
        updatedNode.left = leftTraverse.result;
        return { result: updatedNode, didEval: true };
      }
      const rightTraverse = traverseAndMaybeExecute(
        node.right,
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
        for (let idx = 0; idx < updatedNode.children.length; idx++) {
          if (found) {
            newChildren.push(updatedNode.children[idx]);
            continue;
          }
          const child = updatedNode.children[idx];
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
          updatedNode.children,
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
    case "variable":
    case undefined:
      return { result: node, didEval: false };
    case "valueFunction":
      const arg = traverseAndMaybeExecute(node.input, inducedVariables, pal);
      if (arg.didEval) {
        updatedNode.input = arg.result;
        return { result: updatedNode, didEval: true };
      } else {
        return { result: updatedNode, didEval: false };
      }

    case "quantifier":
      throw new Error("Quantifiers should not be evaluated here", node);

    default:
      console.log(node.nodeType, " not implemented yet", node);
      throw new Error(`${node.nodeType} not implemented yet`, node);
      return { result: node, didEval: false };
  }
}
export function generateEvaluations(
  node: LLNode,
  inducedVariables: Record<string, Color>,
  pal: Palette
): LLNode[] {
  const evalLog = [node.copy()];
  let currentNode = node.copy();
  while (!subTreeIsPureOp(currentNode) && !isValue(currentNode)) {
    const result = traverseAndMaybeExecute(currentNode, inducedVariables, pal);
    evalLog.push(result.result);
    currentNode = result.result;
  }
  const result = evaluateNode(node, inducedVariables, pal).result;
  const astResult = LLTypes.LLValue.tryToConstruct(result, {} as any);
  evalLog.push(astResult);
  return evalLog;
}
