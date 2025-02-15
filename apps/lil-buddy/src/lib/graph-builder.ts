import { LLTypes, Environment } from "color-buddy-palette-lint";

type LLNode = InstanceType<(typeof LLTypes)["LLNode"]>;
type LLPair = InstanceType<(typeof LLTypes)["LLPairFunction"]>;
type LLList = InstanceType<(typeof LLTypes)["LLMap"]>;
type LLQuantifier = InstanceType<(typeof LLTypes)["LLQuantifier"]>;
export function BuildGraph(node: LLNode): {
  nodes: LLNode[];
  edges: { from: number; to: number }[];
} {
  const nodes: LLNode[] = [];
  const edges: { from: number; to: number }[] = [];
  const visited = new Set<number>();
  const queue: any[] = [node];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!current) continue;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    nodes.push(current);
    switch (current.nodeType) {
      case "pairFunction":
      case "numberOp":
      case "predicate":
        edges.push({ from: current.id, to: (current as LLPair).left.id });
        queue.push((current as LLPair).left);
        edges.push({
          from: current.id,
          to: (current as LLPair).right.id,
        });
        queue.push((current as LLPair).right);
        break;
      case "aggregate":
      case "array":
      case "conjunction":
      case "map":
        const children = (current as LLList).children;
        if (Array.isArray(children)) {
          children.forEach((x) => {
            edges.push({ from: current.id, to: x.id });
            queue.push(x);
          });
        } else {
          edges.push({ from: current.id, to: children.id });
          queue.push(children);
        }
        break;
      case "node":
      case "expression":
        queue.push((current as any).value);
        break;
      case "boolFunction":
      case "valueFunction":
        edges.push({ from: current.id, to: (current as any).input.id });
        queue.push((current as any).input);
        break;
      case "quantifier":
        const innerNode = current as LLQuantifier;
        if (innerNode.where) {
          edges.push({ from: innerNode.id, to: innerNode.where.id });
          queue.push(innerNode.where);
        }
        edges.push({ from: innerNode.id, to: innerNode.predicate.id });
        queue.push(innerNode.predicate);
        edges.push({
          from: innerNode.id,
          to: innerNode.input.id,
        });
        queue.push(innerNode.input);
        break;
      case "bool":
      case "color":
      case "number":
      case "value":
      case "variable":
      default:
        console.log("not implemented yet");
        break;
    }
  }
  return { nodes, edges };
}
