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
  let newEnv = new Environment(pal, {}, opts, {});

  newEnv = Object.entries(inducedVariables).reduce((acc, [key, value]) => {
    const newVal = new LLTypes.LLValue(
      new LLTypes.LLColor(value, value.toHex())
    );
    return acc.set(key, newVal);
  }, newEnv);
  return node.evaluate(newEnv);
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
    default:
      return false;
  }
}
function subTreeIsPureOp(node: any): boolean {
  switch (node.nodeType) {
    case "pairFunction":
    case "predicate":
      return isValue(node.left) && isValue(node.right);
    case "conjunction":
      if (node.type === "not") {
        return isValue(node.children[0]);
      }
      return node.children.every((x: any) => subTreeIsPureOp(x));
    case "array":
      return node.children.every((x: any) => subTreeIsPureOp(x));
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
    // todo
    case "quantifier":
    case "aggregate":
    case "map":
    default:
      return false;
  }
}
function traverseAndMaybeExecute(
  node: any,
  inducedVariables: Record<string, Color>,
  pal: Palette
): {
  result: any;
  didEval: boolean;
} {
  const thisIsPureOp = subTreeIsPureOp(node);
  if (thisIsPureOp) {
    const result = evaluateNode(node, inducedVariables, pal).result;
    const astResult = LLTypes.LLValue.tryToConstruct(result, {} as any);
    return { result: astResult, didEval: true };
  }
  //   let updatedNode = node.deepCopy();
  let updatedNode = Object.assign({}, node);
  switch (node.nodeType) {
    case "pairFunction":
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
      if (rightTraverse) {
        updatedNode.right = rightTraverse.result;
        return { result: updatedNode, didEval: true };
      }
      return { result: updatedNode, didEval: false };
    case "conjunction":

    case "array":
      const newChildren = [];
      let found = false;
      for (let idx = 0; idx < node.children.length; idx++) {
        if (found) {
          newChildren.push(node.children[idx]);
          continue;
        }
        const child = node.children[idx];
        const childResult = traverseAndMaybeExecute(
          child,
          inducedVariables,
          pal
        );
        newChildren.push(childResult.result);
        found = childResult.didEval;
      }
      node.children = newChildren;
      return { result: node, didEval: found };
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
    case "aggregate":
    case "map":
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
  const evalLog = [node];
  //   let currentNode = node.deepCopy();
  let currentNode = Object.assign({}, node);
  while (!subTreeIsPureOp(currentNode)) {
    const result = traverseAndMaybeExecute(currentNode, inducedVariables, pal);
    evalLog.push(result.result);
    currentNode = result.result;
  }
  const result = evaluateNode(node, inducedVariables, pal).result;
  const astResult = LLTypes.LLValue.tryToConstruct(result, {} as any);
  evalLog.push(astResult);
  return evalLog;
}
