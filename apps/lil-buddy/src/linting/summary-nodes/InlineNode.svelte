<script lang="ts">
  import type { Palette } from "color-buddy-palette";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, any> = {};

  function toThreeDigit(num: number): string {
    let str = (Math.round(num * 1000) / 1000).toString();
    const [left, right] = str.split(".");
    if (right && right.length < 3) {
      str += "0".repeat(3 - right.length);
    }
    if (left.length < 3) {
      str = " ".repeat(3 - left.length) + str;
    }
    return str;
  }
  $: env = { ...inducedVariables, ...node?.inducedVariables };
  $: console.log(inducedVariables, node?.inducedVariables);
</script>

<div class="flex items-center">
  {#if node.nodeType === "predicate"}
    <div class="flex">
      <div class="border p-2 border-black flex">
        <svelte:self node={node.left} {pal} inducedVariables={env} />
        <div class="px-1">{node.type}</div>
        <svelte:self node={node.right} {pal} inducedVariables={env} />
      </div>
    </div>
  {:else if node.nodeType === "conjunction" && node.type === "not"}
    <div class="flex items-center border border-black p-1">
      <span class="mr-2">NOT</span>
      <svelte:self node={node.children[0]} {pal} inducedVariables={env} />
    </div>
  {:else if node.nodeType === "conjunction"}
    <div class="flex flex-col">
      <div>{node.type}</div>
      {#each node.children as child}
        <svelte:self node={child} {pal} inducedVariables={env} />
      {/each}
    </div>
  {:else if node.nodeType === "number"}
    <div class="font-mono text-sm">{`${toThreeDigit(node.value)}`}</div>
  {:else if node.nodeType === "variable"}
    {#if env[node.value]}
      <div
        class="h-5 w-5 rounded-full"
        style={`background: ${env[node.value].toHex()}`}
      />
    {:else if node.value === "colors"}
      {#each pal.colors as color}
        <div
          class="h-5 w-5 rounded-full"
          style={`background: ${color.toHex()}`}
        />
      {/each}
    {:else}
      <div>{node.value}</div>
    {/if}
  {:else if node.nodeType === "pairFunction"}
    <div class="flex">
      {node.type}
      <span>{"("}</span>
      <svelte:self node={node.left} {pal} inducedVariables={env} />
      <span>{","}</span>
      <svelte:self node={node.right} {pal} inducedVariables={env} />
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "valueFunction"}
    <div class="flex">
      {node.type}
      <span>{"("}</span>
      <svelte:self node={node.input} {pal} inducedVariables={env} />
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "color"}
    <!-- color names are parsed as colors unfortunately, so this is a hack -->
    {#if node.value.channels["L"] === 0 && node.value.channels["a"] === 0 && node.value.channels["b"] === 0 && node.constructorString !== "#000"}
      {node.constructorString}
    {:else}
      <div
        class="h-5 w-5 rounded-full"
        style={`background: ${node.value.toHex()}`}
      />
    {/if}
  {:else if node.nodeType === "bool"}
    <div>{node.value}</div>
  {:else if node.nodeType === "aggregate"}
    <div class="flex">
      {node.type}
      <span>{"("}</span>
      {#if Array.isArray(node.children)}
        {#each node.children as child}
          <svelte:self node={child} {pal} inducedVariables={env} />
          {#if child !== node.children[node.children.length - 1]}
            <span>{","}</span>
          {/if}
        {/each}
      {:else}
        <svelte:self node={node.children} {pal} inducedVariables={env} />
      {/if}
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "array"}
    <div class="flex">
      <span>{"["}</span>
      {#if Array.isArray(node.children)}
        {#each node.children as child}
          <svelte:self node={child} {pal} inducedVariables={env} />
          {#if child !== node.children[node.children.length - 1]}
            <span>{","}</span>
          {/if}
        {/each}
      {:else}
        <svelte:self node={node.children} {pal} inducedVariables={env} />
      {/if}
      <span>{"]"}</span>
    </div>
  {:else if node.nodeType === "map"}
    <div class="flex">
      {node.type}
      <span>{"("}</span>
      {#if Array.isArray(node.children)}
        {#each node.children as child}
          <svelte:self node={child} {pal} inducedVariables={env} />
          {#if child !== node.children[node.children.length - 1]}
            <span>{","}</span>
          {/if}
        {/each}
      {:else}
        <svelte:self node={node.children} {pal} inducedVariables={env} />
      {/if}
      <span>{","}</span>
      <div>{node.varb}</div>
      <span>{"=>"}</span>
      <svelte:self node={node.func} {pal} inducedVariables={env} />
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "expression"}
    <svelte:self node={node.value} {pal} inducedVariables={env} />
  {/if}
</div>
