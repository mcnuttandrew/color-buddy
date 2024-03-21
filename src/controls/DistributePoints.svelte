<script lang="ts">
  import { colorPickerConfig } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  import { distributePoints } from "../lib/utils";
  import type { Direction } from "../lib/utils";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = currentPal.colorSpace;
  $: config = colorPickerConfig[colorSpace];
  $: zName = colorPickerConfig[colorSpace].zChannel;

  $: directions = [
    { direction: "horizontal", name: config.isPolar ? "radial" : "horizontal" },
    { direction: "vertical", name: config.isPolar ? "angle" : "vertical" },
    { direction: "in z space", name: `in ${zName.toUpperCase()} space` },
  ] as Direction[];
</script>

{#if focusedColors.length > 2}
  <div class="w-full border-t-2 border-black my-2"></div>
  <div class="font-bold">Distribute</div>
  <div class="flex flex-wrap">
    {#each directions as direction}
      <button
        class={buttonStyle}
        on:click={() =>
          colorStore.setCurrentPalColors(
            distributePoints(direction, focusedColors, colors, colorSpace)
          )}
      >
        {direction.name}
      </button>
    {/each}
  </div>
{/if}
