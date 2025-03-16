<script lang="ts">
  import { GenerateAST } from "color-buddy-palette-lint";
  import type { LintProgram } from "color-buddy-palette-lint";
  import { BuildGraph, trimTree } from "../lib/graph-builder";
  import ELK from "elkjs/lib/elk.bundled.js";
  import { scaleLinear } from "d3";
  export let lint: LintProgram;
  $: ast = getAST(lint.program);
  function getAST(lint: string) {
    try {
      const ast = (GenerateAST(JSON.parse(lint) as any).value as any)
        .children[0] as any;
      ast.generatePath();
      const graph = BuildGraph(trimTree(ast));
      return graph;
    } catch (e) {
      console.error(e);
    }
  }

  let sim = { nodes: [] as any[], edges: [] as any[], nodeIndex: new Map() };
  function computeGraphLayout(graph: {
    nodes: any[];

    edges: { from: number; to: number }[];
  }) {
    if (!graph) return { nodes: [], edges: [], nodeIndex: new Map() };
    const nodes = graph.nodes;
    const edges = graph.edges;
    const elk = new ELK();
    elk
      .layout({
        id: "root",
        children: nodes.map((x) => ({ id: x.id })),
        edges: edges.map((x) => ({
          id: `${x.from}-${x.to}`,
          sources: [x.from],
          targets: [x.to],
        })) as any,
        layoutOptions: {
          // "elk.algorithm": "layered", "elk.direction": "DOWN"
        },
      })
      .then((x: any) => {
        const nodeIndex = new Map(nodes.map((d) => [d.id, d]));
        const idToPos = new Map(
          x.children.map((x: any) => [x.id, { x: x.x, y: x.y }])
        );
        sim = {
          nodeIndex,
          nodes: x.children.map((x: any) => ({
            ...nodeIndex.get(x.id),
            x: x.x,
            y: x.y,
          })),
          edges: graph.edges.map((x) => ({
            from: idToPos.get(x.from),
            to: idToPos.get(x.to),
          })) as any,
        };
      })
      .catch(console.error);
  }

  $: ast && computeGraphLayout(ast);
  function domain(vals: any[]) {
    return [Math.min(...vals), Math.max(...vals)];
  }
  $: xScale = scaleLinear()
    .domain(domain(sim.nodes ? sim.nodes.map((x) => x.x) : [0, 1]))
    .range([0, 500]);
  $: yScale = scaleLinear()
    .domain(domain(sim.nodes ? sim.nodes.map((x) => x.y) : [0, 1]))
    .range([0, 500]);

  function getText(node: any) {
    switch (node.nodeType) {
      case "variable":
      case "number":
        return node.value;
      default:
        return node.type || node.nodeType;
    }
  }
</script>

{#if sim}
  <svg width="500px" height="500px" class="overflow-visible">
    {#each sim.edges as edge}
      <line
        x1={xScale(edge.from.x)}
        y1={yScale(edge.from.y)}
        x2={xScale(edge.to.x)}
        y2={yScale(edge.to.y)}
        stroke="black"
      />
    {/each}
    {#each sim.nodes as node}
      <g transform={`translate(${xScale(node.x)}, ${yScale(node.y)})`}>
        <circle cx={0} cy={0} r={15} fill="white" stroke="black" />

        <text class="text-item">{getText(node)}</text>
      </g>
    {/each}
  </svg>
{/if}

<style>
  .text-item {
    font-size: 12px;
    text-anchor: middle;
    dominant-baseline: middle;
  }
</style>
