<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  import { Color } from "color-buddy-palette";
  import Tooltip from "../../components/Tooltip.svelte";
  import NodeWrap from "./NodeWrap.svelte";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, any>;
  export let modifyLint: (path: (number | string)[], newValue: any) => void;

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
  $: env = {
    ...inducedVariables,
    ...node?.inducedVariables,
    background: pal.background,
  };

  function getLuminance(color: string) {
    const clr = Color.colorFromHex(color, "lab");
    return clr.luminance();
  }
</script>

<div
  class="flex items-center border summarizer-node-{node.nodeType}--{node.type}"
>
  {#if node.nodeType === "predicate"}
    <div class="flex">
      <div class="border p-2 border-black flex">
        <svelte:self
          {modifyLint}
          node={node.left}
          {pal}
          inducedVariables={env}
        />
        <NodeWrap
          options={["==", "!=", "<", ">", "<=", ">=", "similar"]}
          {node}
          {modifyLint}
          label={node.type === "similar" ? "≈" : node.type}
        />
        <svelte:self
          {modifyLint}
          node={node.right}
          {pal}
          inducedVariables={env}
        />
      </div>
    </div>
  {:else if node.nodeType === "conjunction" && node.type === "not"}
    <div class="flex items-center border border-black p-1">
      <span class="mr-2">NOT</span>
      <DispatchNode
        node={node.children[0]}
        {pal}
        {inducedVariables}
        {modifyLint}
      />
    </div>
  {:else if node.nodeType === "conjunction"}
    <div class="flex flex-col border border-black p-1 items-center">
      {#each node.children as child, idx}
        <DispatchNode node={child} {pal} {inducedVariables} {modifyLint} />
        {#if idx !== node.children.length - 1}
          <div>{node.type}</div>
        {/if}
      {/each}
    </div>
  {:else if node.nodeType === "numberOp"}
    <div class="flex">
      <svelte:self {modifyLint} node={node.left} {pal} inducedVariables={env} />
      <NodeWrap
        options={["+", "-", "*", "/", "//", "absDiff", "%"]}
        {node}
        {modifyLint}
        label="{node.type === 'similar' ? '≈' : node.type}}"
      />
      <svelte:self
        {modifyLint}
        node={node.right}
        {pal}
        inducedVariables={env}
      />
    </div>
  {:else if node.nodeType === "number"}
    <NodeWrap
      options="number"
      {node}
      {modifyLint}
      label={toThreeDigit(node.value)}
    />
  {:else if node.nodeType === "variable"}
    <div class="relative">
      {#if node.value.length > 2}
        <div class="text-xs absolute" style="top: -1em">
          {node.value}
        </div>
      {/if}
      {#if env[node.value]}
        <div
          class="h-5 w-5 rounded-full"
          style={`background: ${env[node.value]}`}
        >
          {#if node.value.length <= 2}
            <div
              class="text-xs left-1/2 text-center"
              class:text-white={getLuminance(env[node.value]) < 0.5}
            >
              {node.value}
            </div>
          {/if}
        </div>
      {:else if node.value === "colors"}
        {#each pal.colors as color}
          <div class="h-5 w-5 rounded-full" style={`background: ${color}`} />
        {/each}
      {:else}
        <div>{node.value}</div>
      {/if}
    </div>
  {:else if node.nodeType === "pairFunction"}
    <div class="flex">
      <NodeWrap
        {modifyLint}
        {node}
        label={node.type}
        options={["dist", "deltaE", "contrast"]}
      />
      <span>{"("}</span>
      <svelte:self {modifyLint} node={node.left} {pal} inducedVariables={env} />
      <span>{","}</span>
      <svelte:self
        {modifyLint}
        node={node.right}
        {pal}
        inducedVariables={env}
      />
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "valueFunction" || node.nodeType === "boolFunction"}
    <div class="flex">
      {#if node.type === "cvdSim"}
        {node.params["type"]}
      {:else}
        {node.type}
      {/if}
      <span>{"("}</span>
      <svelte:self
        {modifyLint}
        node={node.input}
        {pal}
        inducedVariables={env}
      />
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "color"}
    <!-- color names are parsed as colors unfortunately, so this is a hack -->
    {#if node.value.channels["L"] === 0 && node.value.channels["a"] === 0 && node.value.channels["b"] === 0 && !new Set( ["#000", "#000000"] ).has(node.constructorString)}
      {node.constructorString}
    {:else}
      <div class="h-5 w-5 rounded-full" style={`background: ${node.value}`} />
    {/if}
  {:else if node.nodeType === "aggregate"}
    <div class="flex">
      {node.type}
      <span>{"("}</span>
      {#if Array.isArray(node.children)}
        {#each node.children as child}
          <svelte:self {modifyLint} node={child} {pal} inducedVariables={env} />
          {#if child !== node.children[node.children.length - 1]}
            <span>{","}</span>
          {/if}
        {/each}
      {:else}
        <svelte:self
          {modifyLint}
          node={node.children}
          {pal}
          inducedVariables={env}
        />
      {/if}
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "array"}
    <div class="flex flex-col">
      {#if Array.isArray(node.children)}
        {#each node.children as child, idx}
          <span class="flex">
            {#if !idx}<span>{"["}</span>{/if}
            <svelte:self
              {modifyLint}
              node={child}
              {pal}
              inducedVariables={env}
            />
            {#if child !== node.children[node.children.length - 1]}
              <span>{","}</span>
            {:else}
              <span>{"]"}</span>
            {/if}
          </span>
        {/each}
      {:else}
        <span>{"["}</span>
        <svelte:self
          {modifyLint}
          node={node.children}
          {pal}
          inducedVariables={env}
        />
        <span>{"]"}</span>
      {/if}
    </div>
  {:else if node.nodeType === "map"}
    <div class="flex items-center">
      {node.type}
      <span>{"("}</span>
      {#if Array.isArray(node.children)}
        {#each node.children as child}
          <svelte:self {modifyLint} node={child} {pal} inducedVariables={env} />
          {#if child !== node.children[node.children.length - 1]}
            <span>{","}</span>
          {/if}
        {/each}
      {:else}
        <svelte:self
          {modifyLint}
          node={node.children}
          {pal}
          inducedVariables={env}
        />
      {/if}
      {#if !new Set(["speed", "reverse"]).has(node.type)}
        <span>{","}</span>
        <div>{node.varb}</div>
        <span>{"→"}</span>
        <svelte:self
          {modifyLint}
          node={node.func}
          {pal}
          inducedVariables={env}
        />
      {/if}
      <span>{")"}</span>
    </div>
  {:else if node.nodeType === "expression"}
    <svelte:self {modifyLint} node={node.value} {pal} inducedVariables={env} />
  {:else if node.nodeType === "bool"}
    <div
      class=" px-2 text-sm rounded-full"
      class:bg-green-300={node.value}
      class:bg-red-300={!node.value}
    >
      {node.value ? "T" : "F"}
    </div>
  {:else if typeof node === "boolean"}
    <div
      class=" px-2 text-sm rounded-full"
      class:bg-green-300={node}
      class:bg-red-300={!node}
    >
      {node ? "T" : "F"}
    </div>
  {/if}
</div>
