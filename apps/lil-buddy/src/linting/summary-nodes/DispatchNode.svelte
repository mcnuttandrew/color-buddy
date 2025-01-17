<script lang="ts">
  import { LLTypes } from "color-buddy-palette-lint";
  import type { Palette, Color } from "color-buddy-palette";
  import { generateEvaluations } from "../../lib/small-step-evaluator";

  import InlineNode from "./InlineNode.svelte";
  import QuantifierNode from "./QuantifierNode.svelte";

  type LLNode = InstanceType<(typeof LLTypes)["LLNode"]>;

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, Color> = {};

  let predicateNodes = [] as any[];
  const evaluableNodeTypes = new Set(["predicate"]);
  if (evaluableNodeTypes.has(node.nodeType)) {
    try {
      predicateNodes = generateEvaluations(node, inducedVariables, pal);
    } catch (e) {
      console.error(e);
    }
  }
  $: console.log(node);
</script>

{#if node.nodeType == "conjunction"}
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
{:else}
  <QuantifierNode {node} {pal} {inducedVariables} />
{/if}
