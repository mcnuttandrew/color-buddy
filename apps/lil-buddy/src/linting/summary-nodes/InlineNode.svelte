<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  import { Color } from "color-buddy-palette";
  import NodeWrap from "./NodeWrap.svelte";
  import store from "../../stores/store";
  import {
    MODIFY_LINT_TARGET_KEY,
    MODIFY_LINT_DELETE,
    toThreeDigit,
  } from "../../lib/utils";

  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, any>;
  export let modifyLint: (path: (number | string)[], newValue: any) => void;

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
        <NodeWrap
          options={["==", "!=", "<", ">", "similar"]}
          path={node.path}
          {node}
          modifyLint={(path, val) => {
            if (val === "similar") {
              modifyLint([...path, "threshold"], 1);
            } else {
              modifyLint([...path, "threshold"], MODIFY_LINT_DELETE);
            }
            modifyLint(path, val);
          }}
          specificValue={node.type}
          classes="px-2"
        >
          {node.type === "similar" ? "≈" : node.type}
        </NodeWrap>

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
        path={node.path}
        {node}
        {modifyLint}
        classes="px-2"
      >
        {node.type === "similar" ? "≈" : node.type}
      </NodeWrap>
      <svelte:self
        {modifyLint}
        node={node.right}
        {pal}
        inducedVariables={env}
      />
    </div>
  {:else if node.nodeType === "number"}
    <NodeWrap options="number" path={node.path} {node} {modifyLint}>
      {toThreeDigit(node.value)}
    </NodeWrap>
  {:else if node.nodeType === "variable"}
    <div class="relative flex">
      {#if node.value.length > 2}
        <div class="text-xs" style="">
          {node.value}:
        </div>
      {/if}
      {#if env[node.value]}
        <NodeWrap
          modifyLint={(_path, value) => {
            // find variable in pal and save index
            let index = pal.colors.findIndex(
              (color) => color.toHex() === env[node.value]
            );
            if (index === -1 && node.value !== "background") {
              return;
            }
            // using -1 to indicate background color
            if (node.value === "background") {
              index = -1;
            }
            // update color in pal
            store.updateColorInCurrentTest(index, value);
          }}
          path={node.path}
          {node}
          options={"color"}
          specificValue={env[node.value]}
        >
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
        </NodeWrap>
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
        path={node.path}
        {node}
        options={["dist", "deltaE", "contrast"]}
      >
        {node.type}
      </NodeWrap>
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
    <NodeWrap
      modifyLint={(path, val) => {
        console.log(node, path, val);
        return modifyLint([...path, MODIFY_LINT_TARGET_KEY], val);
      }}
      path={node.path}
      {node}
      options={[
        "cvdSim",
        "name",
        "inGamut",
        ...["hsl", "rgb", "lab", "hsv", "lch"].flatMap((x) =>
          x.split("").map((letter) => `${x}.${letter}`)
        ),
      ]}
      specificValue={node.type}
    >
      <!-- <div class="flex">
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
      </div> -->
      <div class="flex flex-col border p-1 bg-slate-700">
        <span class="mr-2 text-white">
          {#if node.type === "cvdSim"}
            {node.params["type"]}
          {:else}
            {node.type}
          {/if}
        </span>
        <div class="bg-white p-1 flex justify-center">
          <svelte:self
            {modifyLint}
            node={node.input}
            {pal}
            inducedVariables={env}
          />
        </div>
      </div>
    </NodeWrap>
  {:else if node.nodeType === "color"}
    <!-- color names are parsed as colors unfortunately, so this is a hack -->
    {#if node.value.channels["L"] === 0 && node.value.channels["a"] === 0 && node.value.channels["b"] === 0 && !new Set( ["#000", "#000000"] ).has(node.constructorString)}
      <NodeWrap path={node.path} {node} {modifyLint} options={"string"}>
        {node.constructorString}
      </NodeWrap>
    {:else}
      <NodeWrap {node} {modifyLint} options={"color"} path={node.path}>
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
    <NodeWrap
      path={node.path}
      {node}
      {modifyLint}
      options={"boolean"}
      classes="px-2 text-sm {node.value ? 'bg-green-300' : 'bg-red-300'}"
    >
      {node.value ? "T" : "F"}
    </NodeWrap>
  {:else if typeof node === "boolean"}
    <NodeWrap
      path={null}
      {node}
      {modifyLint}
      options={"boolean"}
      classes="px-2 text-sm {node ? 'bg-green-300' : 'bg-red-300'}"
    >
      {node ? "T" : "F"}
    </NodeWrap>
  {/if}
</div>
