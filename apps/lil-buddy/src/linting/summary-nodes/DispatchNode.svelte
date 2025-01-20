<script lang="ts">
  import type { Palette, Color } from "color-buddy-palette";
  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";
  import { getPredNodes, handleEval } from "./visual-summary-utils";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, Color> = {};

  $: predicateNodes = getPredNodes(node, inducedVariables, pal) as any[];

  $: isNotNode = node.nodeType === "conjunction" && node.type === "not";
  function shouldComputeResult(node: any) {
    const conjTypes = new Set(["and", "or"]);
    return node.nodeType === "conjunction" && conjTypes.has(node.type);
  }
</script>

{#if node.nodeType == "conjunction" && !isNotNode}
  <div class="flex items-center">
    <div
      class="flex flex-col ml-2"
      class:border={node.type !== "id"}
      class:p-2={node.type !== "id"}
    >
      {#if node.type !== "id"}
        <div>{node.type}</div>
      {/if}
      {#each node.children as child}
        <div class="flex">
          <svelte:self node={child.value} {pal} {inducedVariables} />
        </div>
      {/each}
    </div>
    {#if shouldComputeResult(node)}
      <div>→{handleEval(node, inducedVariables, pal).result}</div>
    {/if}
  </div>
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
