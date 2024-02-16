<script lang="ts">
  import focusStore from "../stores/focus-store";
  import type { Palette } from "../types";
  import Tooltip from "./Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  import { toggleElement } from "../lib/utils";
  export let pal: Palette;
  export let allowModification: boolean = false;
  export let highlightSelected: boolean = false;

  $: focusColors = $focusStore.focusedColors;
  $: focusSet = new Set($focusStore.focusedColors);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="flex flex-wrap rounded p-2 grow"
  style="background-color: {pal.background.toDisplay()};"
  on:click={() => focusStore.clearColors()}
>
  {#each pal.colors as color, idx}
    {#if allowModification}
      <Tooltip allowDrag={true}>
        <div slot="content" class="flex flex-col" let:onClick>
          <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
        </div>
        <button
          slot="target"
          let:tooltipOpen
          let:toggle
          on:click|stopPropagation|preventDefault={(e) => {
            const isMeta = e.metaKey || e.ctrlKey || e.shiftKey;
            let newColors = [...focusColors];
            if (isMeta) {
              newColors = toggleElement(focusColors, idx);
            } else {
              newColors = tooltipOpen ? [] : [idx];
            }

            focusStore.setColors(newColors);
            toggle();
          }}
          class={"w-6 h-6 mx-2 rounded-full transition-all"}
          class:w-8={highlightSelected && focusSet.has(idx)}
          class:h-8={highlightSelected && focusSet.has(idx)}
          style="background-color: {color.toDisplay()}"
        ></button>
      </Tooltip>
    {:else}
      <div
        class={"w-6 h-6 mx-1 rounded-full transition-all"}
        class:w-8={highlightSelected && focusSet.has(idx)}
        class:h-8={highlightSelected && focusSet.has(idx)}
        style="background-color: {color.toDisplay()}"
      ></div>
    {/if}
  {/each}
</div>
