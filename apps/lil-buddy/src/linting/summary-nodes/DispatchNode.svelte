<script lang="ts">
  import type { Palette, Color } from "color-buddy-palette";
  import { generateEvaluations } from "../../lib/small-step-evaluator";

  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, Color> = {};

  $: predicateNodes = getPredNodes(node, inducedVariables, pal) as any[];
  const evalNodeTypes = new Set(["predicate"]);
  $: isNotNode = node.nodeType === "conjunction" && node.type === "not";
  function getPredNodes(
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
</script>

{#if node.nodeType == "conjunction" && !isNotNode}
  {#each node.children as child}
    <svelte:self node={child.value} {pal} {inducedVariables} />
  {/each}
{:else if node.nodeType === "expression"}
  <svelte:self node={node.value} {pal} {inducedVariables} />
{:else if predicateNodes.length}
  {#each predicateNodes as predicateNode}
    <div class="flex items-center">
      <div>→</div>
      <InlineNode node={predicateNode} {pal} {inducedVariables} />
    </div>
  {/each}
{:else if node.nodeType === "quantifier"}
  <QuantifierNode {node} {pal} {inducedVariables} />
{/if}
