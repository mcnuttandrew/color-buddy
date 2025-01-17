<script lang="ts">
  import type { Palette, Color } from "color-buddy-palette";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, Color> = {};
  $: console.log("asd", node);
</script>

<div class="flex items-center">
  {#if node.nodeType === "predicate"}
    <div class="flex">
      <div class="border p-2 border-black flex">
        <svelte:self node={node.left} {pal} {inducedVariables} />
        <div>{node.type}</div>
        <svelte:self node={node.right} {pal} {inducedVariables} />
      </div>
    </div>
  {:else if node.nodeType === "conjunction" && node.type === "not"}
    <div>
      NOT <svelte:self node={node.children[0]} {pal} {inducedVariables} />
    </div>
  {:else if node.nodeType === "number"}
    <div>{node.value}</div>
  {:else if node.nodeType === "variable"}
    {#if inducedVariables[node.value]}
      <div
        class="h-5 w-5 rounded-full"
        style={`background: ${inducedVariables[node.value].toHex()}`}
      />
    {:else}
      <div>{node.value}</div>
    {/if}
  {:else if node.nodeType === "pairFunction"}
    <div class="flex">
      {node.type}
      <span>{"("}</span>
      <svelte:self node={node.left} {pal} {inducedVariables} />
      <span>{","}</span>
      <svelte:self node={node.right} {pal} {inducedVariables} />
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "valueFunction"}
    <div class="flex">
      {node.type}
      <span>{"("}</span>
      <svelte:self node={node.input} {pal} {inducedVariables} />
      <span>{")"}</span>
    </div>
  {:else if node.type === "color"}
    <div>hi</div>
  {:else if node.nodeType === "bool"}
    <div>{node.value}</div>
  {/if}
</div>
