<script lang="ts">
  import { Color } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { clipToGamut } from "../../lib/utils";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = $colorStore.currentPal.colorSpace;

  type ColorEffect = (color: Color) => [number, number, number];
  function actionOnColor(focusedColors: number[], action: ColorEffect) {
    const newColors = [...colors];
    focusedColors.forEach((idx) => {
      const channels = action(colors[idx]);
      newColors[idx] = Color.colorFromChannels(channels, colorSpace);
    });
    colorStore.setCurrentPalColors(newColors);
  }
  const actions: { name: string; effect: ColorEffect }[] = [
    {
      name: "Lighten",
      effect: (color) => color.toColorIO().set("lch.l", (l) => l * 1.2).coords,
    },
    {
      name: "Darken",
      effect: (color) => color.toColorIO().set("lch.l", (l) => l * 0.8).coords,
    },
    {
      name: "Saturate",
      effect: (color) => color.toColorIO().set("lch.c", (c) => c * 1.2).coords,
    },
    {
      name: "Desaturate",
      effect: (color) => color.toColorIO().set("lch.c", (c) => c * 0.8).coords,
    },
    {
      name: "Convert To Opposing",
      effect: (color) =>
        color.toColorIO().set("hsl.h", (h) => (h + 180) % 360).coords,
    },
    {
      name: "Clip to gamut",
      effect: (color) => clipToGamut(color),
    },
  ];
</script>

{#if focusedColors.length >= 1}
  <Tooltip>
    <div slot="content">
      {#each actions as action}
        <button
          class={buttonStyle}
          on:click={() => actionOnColor(focusedColors, action.effect)}
        >
          {action.name}
        </button>
      {/each}
    </div>
    <div slot="target" let:toggle>
      <button class={buttonStyle} on:click={toggle}>Adjust Color</button>
    </div>
  </Tooltip>
{/if}
