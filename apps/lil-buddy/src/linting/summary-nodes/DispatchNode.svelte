<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, any> = {};
</script>

{#if !node}
  <div />
{:else if node.nodeType === "expression"}
  <svelte:self node={node.value} {pal} />
{:else if node.nodeType === "quantifier" || node.quant}
  <QuantifierNode {node} {pal} />
{:else}
  <InlineNode {node} {pal} {inducedVariables} />
{/if}
