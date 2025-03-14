<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  import { Color } from "color-buddy-palette";
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
  class="flex items-center summarizer-node-{node.nodeType}--{node.type} text-xs font-mono"
>
  {#if node.nodeType === "predicate"}
    <div class="flex">
      <div class="border p-2 flex items-center">
        <svelte:self
          {modifyLint}
          node={node.left}
          {pal}
          inducedVariables={env}
        />
        <div class="px-2">
          <NodeWrap
            options={["==", "!=", "<", ">", "similar"]}
            {node}
            {modifyLint}
            label={node.type === "similar" ? "≈" : node.type}
          />
        </div>
        <svelte:self
          {modifyLint}
          node={node.right}
          {pal}
          inducedVariables={env}
        />
      </div>
    </div>
  {:else if node.nodeType === "conjunction" && node.type === "not"}
    <div class="flex flex-col border p-1 bg-slate-700">
      <span class="mr-2 text-white">NOT</span>
      <div class="bg-white">
        <DispatchNode
          node={node.children[0]}
          {pal}
          {inducedVariables}
          {modifyLint}
        />
      </div>
    </div>
  {:else if node.nodeType === "conjunction"}
    <div
      class="flex flex-col border border-black p-1 items-center bg-slate-500"
    >
      {#each node.children as child, idx}
        <div class="bg-white">
          <DispatchNode node={child} {pal} {inducedVariables} {modifyLint} />
        </div>
        {#if idx !== node.children.length - 1}
          <div class="text-white uppercase font-bold">{node.type}</div>
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
        label={node.type === "similar" ? "≈" : node.type}
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
    <div class="relative flex">
      {#if node.value.length > 2}
        <div class="text-xs" style="">
          {node.value}:
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
      <NodeWrap
        label={node.constructorString}
        {node}
        {modifyLint}
        options={"string"}
        classes=""
        comment=""
      />
    {:else}
      <NodeWrap
        label={""}
        {node}
        {modifyLint}
        options={"color"}
        classes=""
        comment=""
      >
        <div class="h-5 w-5 rounded-full" style={`background: ${node.value}`} />
      </NodeWrap>
    {/if}
  {:else if node.nodeType === "aggregate"}
    <div class="flex flex-col border">
      <div class="w-full bg-green-500 uppercase px-2">{node.type}</div>
      <div class="p-2">
        {#if Array.isArray(node.children)}
          {#each node.children as child}
            <svelte:self
              {modifyLint}
              node={child}
              {pal}
              inducedVariables={env}
            />
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
      </div>
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
    <div class="flex flex-col items-center border">
      <div class="w-full bg-blue-500 uppercase px-2">{node.type}</div>
      <div class="">
        <div class="flex p-2">
          {#if Array.isArray(node.children)}
            {#each node.children as child}
              <svelte:self
                {modifyLint}
                node={child}
                {pal}
                inducedVariables={env}
              />
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
        </div>
        {#if !new Set(["speed", "reverse"]).has(node.type)}
          <div class="flex">
            <div>{node.varb}</div>
            <span>{"→"}</span>
            <svelte:self
              {modifyLint}
              node={node.func}
              {pal}
              inducedVariables={env}
            />
          </div>
        {/if}
      </div>
    </div>
  {:else if node.nodeType === "expression"}
    <svelte:self {modifyLint} node={node.value} {pal} inducedVariables={env} />
  {:else if node.nodeType === "bool"}
    <div
      class=" px-2 text-sm"
      class:bg-green-300={node.value}
      class:bg-red-300={!node.value}
    >
      <NodeWrap
        label={node.value ? "T" : "F"}
        {node}
        {modifyLint}
        options={"boolean"}
        classes="text-xs"
        comment=""
      />
    </div>
  {:else if typeof node === "boolean"}
    <div
      class=" px-2 text-sm"
      class:bg-green-300={node}
      class:bg-red-300={!node}
    >
      <NodeWrap
        label={node ? "T" : "F"}
        {node}
        {modifyLint}
        options={"boolean"}
        classes="text-xs"
        comment=""
      />
    </div>
  {/if}
</div>
