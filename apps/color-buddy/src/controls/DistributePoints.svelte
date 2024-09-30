<script lang="ts">
  import CenterIcon from "virtual:icons/fa6-solid/align-center";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";
  import { colorPickerConfig, titleCase } from "../lib/utils";
  import { distributePoints } from "color-buddy-palette";
  import Tooltip from "../components/Tooltip.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = currentPal.colorSpace;
  $: config = colorPickerConfig[colorSpace];
  $: zName = colorPickerConfig[colorSpace].zChannel;

  $: directions = [
    {
      direction: "horizontal",
      name: config.isPolar ? "radial" : "horizontal",
    },
    { direction: "vertical", name: config.isPolar ? "angle" : "vertical" },
    { direction: "in z space", name: `in ${zName.toUpperCase()} space` },
  ] as Parameters<typeof distributePoints>[0][];
</script>

<div class="flex">
  {#each directions as direction}
    <button
      class={`${buttonStyle} flex items-center h-full justify-between`}
      on:click={() =>
        colorStore.setCurrentPalColors(
          distributePoints(direction, focusedColors, colors, colorSpace)
        )}
    >
      {#if direction.name === "vertical"}
        <CenterIcon class="text-sm mr-3" />
      {:else if direction.name === "horizontal"}
        <CenterIcon class="text-sm mr-3 rotate-90" />
      {/if}
      {titleCase(direction.name)}
    </button>
  {/each}
</div>
