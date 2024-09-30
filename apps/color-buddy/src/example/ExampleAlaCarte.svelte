<script lang="ts">
  import exampleStore from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import Example from "./Example.svelte";
  import Vega from "./Vega.svelte";
  import Swatches from "./Swatches.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import DownChevron from "virtual:icons/fa6-solid/chevron-down";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";

  export let exampleIdx: number;
  export let setExampleIdx: (idx: number) => void;
  export let paletteIdx: number | "tempPal";
  export let allowModification: boolean = false;
  export let bgColor: string = "white";
  export let size: number = 400;
  export let labelStyle: string = "";

  $: example = { ...$exampleStore.examples[exampleIdx], size } as any;
  $: palette =
    paletteIdx === "tempPal"
      ? $configStore.tempPal!
      : $colorStore.palettes[paletteIdx];
</script>

<div class="flex {labelStyle}">
  <div class="mr-2">Preview style:</div>
  <Tooltip bg="bg-white">
    <div slot="content" class="max-w-md flex flex-col max-h-96 overflow-auto">
      <button
        class={simpleTooltipRowStyle}
        class:font-bold={exampleIdx === -1}
        on:click={() => setExampleIdx(-1)}
      >
        Text and Swatches
      </button>
      <div class="my-3 border-t border-black"></div>
      {#each $exampleStore.examples as example, idx}
        {#if "vega" in example}
          <button
            class={simpleTooltipRowStyle}
            class:font-bold={exampleIdx === idx}
            on:click={() => setExampleIdx(idx)}
          >
            {example.name}
          </button>
        {/if}
      {/each}
      <div class="my-3 border-t border-black"></div>
      {#each $exampleStore.examples as example, idx}
        {#if "svg" in example}
          <button
            class={simpleTooltipRowStyle}
            class:font-bold={exampleIdx === idx}
            on:click={() => setExampleIdx(idx)}
          >
            {example.name}
          </button>
        {/if}
      {/each}
    </div>
    <button
      slot="target"
      let:toggle
      class={`${buttonStyle} flex justify-between w-full items-center`}
      on:click={toggle}
    >
      <span>{example?.name || "Text and Swatches"}</span>
      <DownChevron class="text-xs" />
    </button>
  </Tooltip>
</div>
<div
  class="h-full flex justify-center items-center"
  style={`background: ${bgColor}`}
>
  {#if exampleIdx === -1}
    <Swatches
      {paletteIdx}
      hideHeader={true}
      allowInteraction={allowModification}
      maxWidth={size}
    />
  {:else}
    {#if example.svg}
      <Example
        example={example.svg}
        size={example.size}
        {bgColor}
        {palette}
        allowInteraction={true}
      />
    {/if}
    {#if example.vega}
      <Vega
        spec={example.vega}
        size={example.size}
        {bgColor}
        {palette}
        allowInteraction={true}
      />
    {/if}
  {/if}
</div>
