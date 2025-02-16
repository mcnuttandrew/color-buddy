<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, any>;
  export let modifyLint: (path: (number | string)[], newValue: any) => void;
</script>

{#if !node}
  <div />
{:else if node.nodeType === "expression"}
  <svelte:self node={node.value} {pal} {inducedVariables} {modifyLint} />
{:else if node.nodeType === "quantifier" || node.quant}
  <QuantifierNode {node} {pal} {inducedVariables} {modifyLint} />
{:else}
  <InlineNode {node} {pal} {inducedVariables} {modifyLint} />
{/if}
