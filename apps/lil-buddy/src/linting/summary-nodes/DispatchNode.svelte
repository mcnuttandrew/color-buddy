<script lang="ts">
  import type { Palette, Color } from "color-buddy-palette";
  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";
  import { getPredNodes } from "./visual-summary-utils";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, Color> = {};

  $: predicateNodes = getPredNodes(node, inducedVariables, pal) as any[];

  $: isNotNode = node.nodeType === "conjunction" && node.type === "not";
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
