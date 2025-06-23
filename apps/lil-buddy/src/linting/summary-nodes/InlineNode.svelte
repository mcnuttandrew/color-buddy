<script lang="ts">
  import DispatchNode from "./DispatchNode.svelte";
  import { Color } from "color-buddy-palette";
  import NodeWrap from "./NodeWrap.svelte";
  import store from "../../stores/store";
  import {
    MODIFY_LINT_TARGET_KEY,
    MODIFY_LINT_DELETE,
    toThreeDigit,
  } from "../../lib/utils";
  import type { SummaryNodeProps } from "./summary-node";
  export let props: SummaryNodeProps;

  $: env = {
    ...props.inducedVariables,
    ...props.node?.inducedVariables,
    background: props.pal.background,
  };

  function getLuminance(color: string) {
    const clr = Color.colorFromHex(color, "lab");
    return clr.luminance();
  }
</script>

<div
  class="flex items-center summarizer-node-{props.node.nodeType}--{props.node
    .type} text-xs font-mono"
>
  {#if props.node.nodeType === "predicate"}
    <div class="flex">
      <div class="border p-2 flex items-center">
        <svelte:self
          props={{ ...props, inducedVariables: env, node: props.node.left }}
        />
        <NodeWrap
          options={["==", "!=", "<", ">", "similar"]}
          path={props.node.path}
          props={{
            ...props,
            modifyLint: (path, val) => {
              if (val === "similar") {
                props.modifyLint([...path, "threshold"], 1);
              } else {
                props.modifyLint([...path, "threshold"], MODIFY_LINT_DELETE);
              }
              props.modifyLint(path, val);
            },
          }}
          specificValue={props.node.type}
          classes="px-2"
        >
          <div class="whitespace-nowrap">
            {props.node.type === "similar" ? "≈" : props.node.type}
          </div>
        </NodeWrap>

        <svelte:self
          props={{ ...props, inducedVariables: env, node: props.node.right }}
        />
      </div>
    </div>
  {:else if props.node.nodeType === "conjunction" && props.node.type === "not"}
    <div class="flex flex-col border p-1 bg-slate-700">
      <span class=" text-white">NOT</span>

      <div class="bg-white">
        <DispatchNode
          props={{
            ...props,
            inducedVariables: env,
            node: props.node.children[0],
          }}
        />
      </div>
    </div>
  {:else if props.node.nodeType === "conjunction"}
    <div
      class="flex flex-col border border-black p-1 items-center bg-slate-500"
    >
      {#each props.node.children as child, idx}
        {#if props.node.children.length === 1}<div
            class="text-white uppercase font-bold"
          >
            {props.node.type}
          </div>
        {/if}
        <div class="bg-white">
          <DispatchNode
            props={{ ...props, inducedVariables: env, node: child }}
          />
        </div>
        {#if idx !== props.node.children.length - 1}
          <div class="text-white uppercase font-bold">{props.node.type}</div>
        {/if}
      {/each}
    </div>
  {:else if props.node.nodeType === "numberOp"}
    <div class="flex items-center">
      <svelte:self
        props={{ ...props, inducedVariables: env, node: props.node.left }}
      />
      <NodeWrap
        props={{ ...props, inducedVariables: {} }}
        options={["+", "-", "*", "/", "//", "absDiff", "%"]}
        path={props.node.path}
        classes="px-2"
      >
        {props.node.type === "similar" ? "≈" : props.node.type}
      </NodeWrap>
      <svelte:self
        props={{ ...props, inducedVariables: env, node: props.node.right }}
        inducedVariables={env}
      />
    </div>
  {:else if props.node.nodeType === "number"}
    <NodeWrap props={{ ...props }} options="number" path={props.node.path}>
      {toThreeDigit(props.node.value)}
    </NodeWrap>
  {:else if props.node.nodeType === "variable"}
    <div class="relative flex">
      {#if props.node.value.length > 2}
        <div class="text-xs" style="">
          {props.node.value}:
        </div>
      {/if}
      {#if env[props.node.value] && typeof env[props.node.value] != "number"}
        <NodeWrap
          props={{
            ...props,
            inducedVariables: env,
            modifyLint: (_path, value) => {
              // find variable in pal and save index
              let index = props.pal.colors.findIndex(
                (color) => color.toHex() === env[props.node.value]
              );
              if (index === -1 && props.node.value !== "background") {
                return;
              }
              // using -1 to indicate background color
              if (props.node.value === "background") {
                index = -1;
              }
              // update color in pal
              store.updateColorInCurrentTest(index, value);
            },
          }}
          path={props.node.path}
          options={"color"}
          specificValue={env[props.node.value]}
        >
          <div
            class="h-5 w-5 rounded-full border border-black"
            style={`background: ${env[props.node.value]}`}
          >
            {#if props.node.value.length <= 2}
              <div
                class="text-xs left-1/2 text-center"
                class:text-white={getLuminance(env[props.node.value]) < 0.5}
              >
                {props.node.value}
              </div>
            {/if}
          </div>
        </NodeWrap>
      {:else if env[props.node.value] && typeof env[props.node.value] === "number"}
        <div>{env[props.node.value]}</div>
      {:else if props.node.value === "colors"}
        {#each props.pal.colors as color}
          <div
            class="h-5 w-5 rounded-full border border-black"
            style={`background: ${color}`}
          />
        {/each}
      {:else}
        <div>{props.node.value}</div>
      {/if}
    </div>
  {:else if props.node.nodeType === "pairFunction"}
    <div class="flex">
      <NodeWrap
        props={{ ...props, inducedVariables: env }}
        path={props.node.path}
        options={["dist", "deltaE", "contrast"]}
      >
        {props.node.type}
      </NodeWrap>
      <span>{"("}</span>
      <svelte:self
        props={{ ...props, inducedVariables: env, node: props.node.left }}
      />
      <span>{","}</span>
      <svelte:self
        props={{ ...props, inducedVariables: env, node: props.node.right }}
      />
      <span>{")"}</span>
    </div>
  {:else if props.node.nodeType === "valueFunction" || props.node.nodeType === "boolFunction"}
    <NodeWrap
      props={{
        ...props,
        inducedVariables: env,
        modifyLint: (path, val) => {
          console.log(props.node, path, val);
          return props.modifyLint([...path, MODIFY_LINT_TARGET_KEY], val);
        },
      }}
      path={props.node.path}
      options={[
        "cvdSim",
        "name",
        "inGamut",
        ...["hsl", "rgb", "lab", "hsv", "lch"].flatMap((x) =>
          x.split("").map((letter) => `${x}.${letter}`)
        ),
      ]}
      specificValue={props.node.type}
    >
      <!-- <div class="flex">
        {#if props.node.type === "cvdSim"}
          {props.node.params["type"]}
        {:else}
          {props.node.type}
        {/if}
        <span>{"("}</span>
        <svelte:self
          {modifyLint}
          node={props.node.input}
          {pal}
          inducedVariables={env}
        />
        <span>{")"}</span>
      </div> -->
      <div class="flex flex-col border p-1 bg-slate-700">
        <span class="mr-2 text-white">
          {#if props.node.type === "cvdSim"}
            {props.node.params["type"]}
          {:else}
            {props.node.type}
          {/if}
        </span>
        <div class="bg-white p-1 flex justify-center">
          <svelte:self
            props={{ ...props, inducedVariables: env, node: props.node.input }}
          />
        </div>
      </div>
    </NodeWrap>
  {:else if props.node.nodeType === "color"}
    <!-- color names are parsed as colors unfortunately, so this is a hack -->
    {#if props.node.value.channels["L"] === 0 && props.node.value.channels["a"] === 0 && props.node.value.channels["b"] === 0 && !new Set( ["#000", "#000000"] ).has(props.node.constructorString)}
      <NodeWrap
        props={{ ...props, inducedVariables: env }}
        path={props.node.path}
        options={"string"}
      >
        {props.node.constructorString}
      </NodeWrap>
    {:else}
      <NodeWrap
        props={{ ...props, inducedVariables: env }}
        options={"color"}
        path={props.node.path}
      >
        <div
          class="h-5 w-5 rounded-full border border-black"
          style={`background: ${props.node.value}`}
        />
      </NodeWrap>
    {/if}
  {:else if props.node.nodeType === "aggregate"}
    <div class="flex flex-col border">
      <div class="w-full bg-green-500 uppercase px-2">{props.node.type}</div>
      <div class="p-2">
        {#if Array.isArray(props.node.children)}
          {#each props.node.children as child}
            <svelte:self
              props={{ ...props, inducedVariables: env, node: child }}
            />
            {#if child !== props.node.children[props.node.children.length - 1]}
              <span>{","}</span>
            {/if}
          {/each}
        {:else}
          <svelte:self
            props={{
              ...props,
              inducedVariables: env,
              node: props.node.children,
            }}
          />
        {/if}
      </div>
    </div>
  {:else if props.node.nodeType === "array"}
    <div class="flex flex-col">
      {#if Array.isArray(props.node.children)}
        {#each props.node.children as child, idx}
          <span class="flex">
            {#if !idx}<span>{"["}</span>{/if}
            <svelte:self
              props={{ ...props, inducedVariables: env, node: child }}
            />
            {#if child !== props.node.children[props.node.children.length - 1]}
              <span>{","}</span>
            {:else}
              <span>{"]"}</span>
            {/if}
          </span>
        {/each}
      {:else}
        <span>{"["}</span>
        <svelte:self
          props={{ ...props, inducedVariables: env, node: props.node.children }}
        />
        <span>{"]"}</span>
      {/if}
    </div>
  {:else if props.node.nodeType === "map"}
    <div class="flex flex-col items-center border">
      <div class="w-full bg-blue-500 uppercase px-2">{props.node.type}</div>
      <div class="">
        <div class="flex p-2">
          {#if Array.isArray(props.node.children)}
            {#each props.node.children as child}
              <svelte:self
                props={{ ...props, inducedVariables: env, node: child }}
              />
              {#if child !== props.node.children[props.node.children.length - 1]}
                <span>{","}</span>
              {/if}
            {/each}
          {:else}
            <svelte:self
              props={{
                ...props,
                inducedVariables: env,
                node: props.node.children,
              }}
            />
          {/if}
        </div>
        {#if !new Set(["speed", "reverse"]).has(props.node.type)}
          <div class="flex">
            <div>{props.node.varb}</div>
            <span>{"→"}</span>
            <svelte:self
              props={{ ...props, inducedVariables: env, node: props.node.func }}
            />
          </div>
        {/if}
      </div>
    </div>
  {:else if props.node.nodeType === "expression"}
    <svelte:self
      props={{ ...props, inducedVariables: env, node: props.node.value }}
    />
  {:else if props.node.nodeType === "bool"}
    <NodeWrap
      props={{ ...props, inducedVariables: env }}
      path={props.node.path}
      options={"boolean"}
      classes="px-2 text-sm {props.node.value ? 'bg-green-300' : 'bg-red-300'}"
    >
      {props.node.value ? "T" : "F"}
    </NodeWrap>
  {:else if typeof props.node === "boolean"}
    <NodeWrap
      props={{ ...props, inducedVariables: env }}
      path={null}
      options={"boolean"}
      classes="px-2 text-sm {props.node ? 'bg-green-300' : 'bg-red-300'}"
    >
      {props.node ? "T" : "F"}
    </NodeWrap>
  {/if}
</div>
