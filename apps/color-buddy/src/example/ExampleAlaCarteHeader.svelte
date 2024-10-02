<script lang="ts">
  import exampleStore from "../stores/example-store";
  import Tooltip from "../components/Tooltip.svelte";
  import DownChevron from "virtual:icons/fa6-solid/chevron-down";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";

  export let exampleIdx: number;
  export let setExampleIdx: (idx: number) => void;
  export let size: number = 400;
  export let labelStyle: string = "";

  $: example = { ...$exampleStore.examples[exampleIdx], size } as any;
</script>

<div class="flex flex-col {labelStyle}">
  <div class="mr-2 text-xs">Preview style</div>
  <Tooltip bg="bg-white">
    <div slot="content" class="max-w-md flex flex-col max-h-96 overflow-auto">
      <button
        class={simpleTooltipRowStyle}
        class:font-bold={exampleIdx === -1}
        on:click={() => setExampleIdx(-1)}
      >
        Swatches
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
      class={`${buttonStyle} flex justify-between  items-center`}
      on:click={toggle}
    >
      <span>{example?.name || "Swatches"}</span>
      <DownChevron class="text-xs ml-2" />
    </button>
  </Tooltip>
</div>
