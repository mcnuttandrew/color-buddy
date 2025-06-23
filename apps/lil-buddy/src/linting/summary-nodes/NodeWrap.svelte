<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import { Color } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  import ColorChannelPicker from "../../components/ColorChannelPicker.svelte";
  import type { SummaryNodeProps } from "./summary-node";
  export let props: SummaryNodeProps;

  export let options:
    | string[]
    | "number"
    | "boolean"
    | "color"
    | "string"
    | null;

  export let classes: string = "";
  export let comment: string = "";
  export let specificValue: any = null;
  export let path: (number | string)[] | null;
  export let index: number | null = null;

  function displayValue(node: any) {
    if (typeof node === "boolean") {
      return node ? "true" : "false";
    }
    if (node.constructorString) {
      return `${node.value} (${node.constructorString})`;
    }
    if (node.value === false || node.value === 0) {
      return node.value;
    }
    return node.value || node.type;
  }
  $: value = specificValue || props.node?.value || null;
  let localSpace = "lab" as any;
  $: isCalculated = !path || path.length < 1;
  $: props.node.results && console.log(props.node.results);
  $: whereSeq = props.node?.results?.at(index)?.whereExplanation || [];
</script>

<Tooltip>
  <div slot="content" class="max-w-screen-md overflow-auto">
    {#if !whereSeq.length}
      {#if props.node}
        <div>
          <div class="text-sm">
            <span class="font-bold">Node Type:</span>
            {props.node.nodeType}
          </div>
          <div class="text-sm">
            <span class="font-bold">Current Value:</span>
            {displayValue(props.node)}
          </div>
        </div>
        <!-- {`${node.nodeType}: ${displayValue(node)}`} -->

        <!-- {#if path && path.length > 1}
        <div class="text-xs text-gray-500">
          {path.map((p) => p).join(".")}
        </div>
      {/if} -->
      {/if}
      <div class="w-full">
        {#if !isCalculated}
          {#if options === "number"}
            <input
              {value}
              class="border"
              type="number"
              on:blur={(e) => {
                // @ts-ignore
                props.modifyLint(path, parseFloat(e.target.value));
              }}
            />
          {:else if options === "color"}
            <ColorChannelPicker
              onSpaceChange={(x) => {
                localSpace = x;
              }}
              colorMode={localSpace}
              color={Color.colorFromHex(
                value?.toHex ? value.toHex() : value,
                localSpace
              )}
              onColorChange={(x) => {
                // @ts-ignore
                props.modifyLint(path, x.toHex());
              }}
            />
          {:else if options === "string"}
            <input
              {value}
              class="border"
              on:blur={(e) => {
                // @ts-ignore
                props.modifyLint(path, e.target.value);
              }}
            />
          {:else if options === "boolean"}
            <select
              {value}
              on:change={(e) => {
                // @ts-ignore
                props.modifyLint(path, e.target.value === "true");
              }}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          {:else if options && Array.isArray(options)}
            <select
              {value}
              on:change={(e) => {
                // @ts-ignore
                props.modifyLint(path, e.target.value);
              }}
            >
              {#each options as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          {/if}
        {:else if options}
          <div class="text-xs">
            This value is <span class="italic">calculated,</span>
            meaning that it can not be altered directly. To modify it, try changing
            something upstream (i.e. to the left).
          </div>
        {/if}
      </div>
    {/if}
    <div>
      {comment}
    </div>
    {#if whereSeq.length}
      <div class="mt-4 border-t pt-4">
        <div class="font-mono text-sm">Explanation</div>
        <div class="flex">
          {#each whereSeq || [] as log, idx}
            <div class="flex items-center">
              <DispatchNode
                props={{
                  node: log,
                  pal: props.pal,
                  inducedVariables: {},
                  modifyLint: () => {},
                }}
              />
              {#if whereSeq && idx !== whereSeq.length - 1}
                <div class="">→</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
    <!-- <DispatchNode /> -->
    <!-- {#if !isCalculated}
      <Tooltip>
        <div slot="content">asd</div>
        <button
          class="text-sm {buttonStyle} my-2"
          slot="target"
          let:toggle
          on:click={toggle}
        >
          Convert to another node type
        </button>
      </Tooltip>
    {/if} -->
  </div>
  <button
    class={classes}
    slot="target"
    let:toggle
    on:click={(e) => {
      e.stopPropagation();
      toggle();
    }}
  >
    <slot />
  </button>
</Tooltip>
