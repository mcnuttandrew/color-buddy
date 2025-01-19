import {
  generateEvaluations,
  evaluateNode,
} from "../../lib/small-step-evaluator";
import { makePalFromString } from "color-buddy-palette";
import type { Palette, Color } from "color-buddy-palette";

const evalNodeTypes = new Set(["predicate"]);
export function getPredNodes(
  node: any,
  inducedVariables: Record<string, Color> = {},
  pal: Palette
) {
  const isNotNode = node.nodeType === "conjunction" && node.type === "not";
  if (evalNodeTypes.has(node.nodeType) || isNotNode) {
    try {
      return generateEvaluations(node, inducedVariables, pal);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function checkWhere(
  node: any,
  color: Color,
  varb: string,
  pal: Palette,
  inducedVariables: Record<string, Color>
): boolean {
  if (!node) return true;
  const result = evaluateNode(
    node,
    { ...inducedVariables, [varb]: color },
    pal
  );
  return result.result;
}

export function handleEval(node: any, inducedVariables: any, pal: any) {
  try {
    return evaluateNode(node, inducedVariables, pal);
  } catch (e) {
    console.error(e);
    return { result: "error" };
  }
}

export function getValues(node: any, pal: Palette) {
  if (node?.input?.value === "colors") {
    return pal.colors;
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
