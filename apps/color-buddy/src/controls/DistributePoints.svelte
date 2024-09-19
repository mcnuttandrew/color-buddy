<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";
  import { colorPickerConfig } from "../lib/utils";
  import { distributePoints } from "color-buddy-palette";
  import Tooltip from "../components/Tooltip.svelte";

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
  ] as Parameters<typeof distributePoints>[0][];
</script>

{#if focusedColors.length > 2}
  <Tooltip bg="bg-white">
    <div slot="content">
      <div class="flex flex-col">
        {#each directions as direction}
          <button
            class={simpleTooltipRowStyle}
            on:click={() =>
              colorStore.setCurrentPalColors(
                distributePoints(direction, focusedColors, colors, colorSpace)
              )}
          >
            {direction.name}
          </button>
        {/each}
      </div>
    </div>
    <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
      Distribute
    </button>
  </Tooltip>
{/if}
