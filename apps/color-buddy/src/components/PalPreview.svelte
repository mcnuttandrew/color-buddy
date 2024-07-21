<script lang="ts">
  import focusStore from "../stores/focus-store";
  import type { Palette } from "color-buddy-palette";
  export let pal: Palette;
  export let allowModification: boolean = false;
  export let highlightSelected: boolean = false;
  export let showTags: boolean = false;

  import { dealWithFocusEvent } from "../lib/utils";

  $: focusSet = new Set($focusStore.focusedColors);
  $: bgLum = pal.background.luminance();
  $: textColor = bgLum > 0.4 ? "#00000066" : "#ffffffaa";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="flex flex-wrap rounded p-2 grow"
  style="background-color: {pal.background.toDisplay()};"
  on:click={() => focusStore.clearColors()}
>
  {#each pal.colors as color, idx}
    <div class="flex flex-col text-center relative items-center">
      {#if allowModification}
        <button
          on:click|stopPropagation|preventDefault={(e) =>
            focusStore.setColors(
              dealWithFocusEvent(e, idx, $focusStore.focusedColors)
            )}
          class={"w-6 h-6 mx-2 rounded-full dot"}
          class:w-8={highlightSelected && focusSet.has(idx)}
          class:h-8={highlightSelected && focusSet.has(idx)}
          style="background-color: {color.toDisplay()}"
        ></button>
      {:else}
        <div
          class={"w-6 h-6 mx-1 rounded-full dot"}
          class:w-8={highlightSelected && focusSet.has(idx)}
          class:h-8={highlightSelected && focusSet.has(idx)}
          style="background-color: {color.toDisplay()}"
        ></div>
      {/if}
      {#if showTags}
        <div
          class="flex flex-col text-center pointer-events-none"
          style={`color: ${textColor}`}
        >
          {#each color.tags as tag}
            <div class="text-xs">{tag}</div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .dot {
    transition:
      height 0.2s,
      width 0.2s;
  }
</style>
