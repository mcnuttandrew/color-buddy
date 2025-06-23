<script lang="ts">
  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";
  import type { SummaryNodeProps } from "./summary-node";
  export let props: SummaryNodeProps;
</script>

{#if !props.node}
  <div />
{:else if props.node.nodeType === "expression"}
  <svelte:self props={{ ...props, node: props.node.value }} />
{:else if props.node.nodeType === "quantifier" || props.node.quant}
  <QuantifierNode {props} />
{:else}
  <InlineNode {props} />
{/if}
