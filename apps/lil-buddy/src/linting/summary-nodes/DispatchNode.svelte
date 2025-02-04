<script lang="ts">
  import type { Palette, Color } from "color-buddy-palette";
  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, any> = {};

  $: isNotNode = node.nodeType === "conjunction" && node.type === "not";
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
          <svelte:self node={child.value} {pal} />
        </div>
      {/each}
    </div>
  </div>
{:else if node.nodeType === "expression"}
  <svelte:self node={node.value} {pal} />
{:else if node.nodeType === "quantifier" || node.quant}
  <QuantifierNode {node} {pal} />
{:else}
  <InlineNode {node} {pal} {inducedVariables} />
{/if}
