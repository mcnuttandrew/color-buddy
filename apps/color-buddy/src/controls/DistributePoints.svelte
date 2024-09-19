<script lang="ts">
  import CenterIcon from "virtual:icons/fa6-solid/align-center";
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
    {
      direction: "horizontal",
      name: config.isPolar ? "radial" : "horizontal",
    },
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
            class={`${simpleTooltipRowStyle} flex items-center h-full justify-between`}
            on:click={() =>
              colorStore.setCurrentPalColors(
                distributePoints(direction, focusedColors, colors, colorSpace)
              )}
          >
            {direction.name}
            {#if direction.name === "vertical"}
              <CenterIcon class="text-sm ml-3" />
            {:else if direction.name === "horizontal"}
              <CenterIcon class="text-sm ml-3 rotate-90" />
            {/if}
          </button>
        {/each}
      </div>
    </div>
    <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
      Distribute
    </button>
  </Tooltip>
{/if}
