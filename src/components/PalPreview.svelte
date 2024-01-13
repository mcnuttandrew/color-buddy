<script lang="ts">
  import focusStore from "../stores/focus-store";
  import type { Palette } from "../stores/color-store";
  import Tooltip from "./Tooltip.svelte";
  import SwatchTooltipContent from "../content-modules/SwatchTooltipContent.svelte";
  export let pal: Palette;
  export let allowModification: boolean = false;
  export let highlightSelected: boolean = false;

  $: focusedColors = new Set($focusStore.focusedColors);
</script>

<div
  class="flex flex-wrap rounded p-2 grow"
  style="background-color: {pal.background.toDisplay()};"
>
  {#each pal.colors as color, idx (idx)}
    {#if allowModification}
      <Tooltip allowDrag={true}>
        <div slot="content" class="flex flex-col" let:onClick>
          <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
        </div>
        <button
          slot="target"
          let:toggle
          on:click={() => {
            focusStore.setColors([idx]);
            toggle();
          }}
          class={"w-6 h-6 mx-2 rounded-full transition-all"}
          class:w-8={highlightSelected && focusedColors.has(idx)}
          class:h-8={highlightSelected && focusedColors.has(idx)}
          style="background-color: {color.toDisplay()}"
        ></button>
      </Tooltip>
    {:else}
      <div
        class={"w-6 h-6 mx-2 rounded-full transition-all"}
        class:w-8={highlightSelected && focusedColors.has(idx)}
        class:h-8={highlightSelected && focusedColors.has(idx)}
        style="background-color: {color.toDisplay()}"
      ></div>
    {/if}
  {/each}
</div>
