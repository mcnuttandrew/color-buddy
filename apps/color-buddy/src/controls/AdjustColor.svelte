<script lang="ts">
  import { Color, clipToGamut } from "color-buddy-palette";
  import { colorPickerConfig } from "../lib/utils";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { clamp } from "../lib/utils";
  import Tooltip from "../components/Tooltip.svelte";

  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = currentPal.colorSpace;

  type ColorEffect = (color: Color) => [number, number, number];
  function actionOnColor(focusedColors: number[], action: ColorEffect) {
    const newColors = [...colors];
    focusedColors.forEach((idx) => {
      const channels = action(colors[idx]);
      const newColor = Color.colorFromChannels(channels, colorSpace);
      newColor.tags = colors[idx].tags;
      newColors[idx] = newColor;
    });
    colorStore.setCurrentPalColors(newColors);
  }
  const actions: { name: string; effect: ColorEffect }[] = [
    {
      name: "Lighten",
      effect: (color) =>
        color.toColorIO().set("lch.l", (l) => clamp(l ? l * 1.2 : 5, 0, 100))
          .coords,
    },
    {
      name: "Darken",
      effect: (color) => color.toColorIO().set("lch.l", (l) => l * 0.8).coords,
    },
    {
      name: "Saturate",
      effect: (color) =>
        color.toColorIO().set("hsl.s", (c) => clamp(c ? c * 1.2 : 5, 0, 100))
          .coords,
    },
    {
      name: "Desaturate",
      effect: (color) => color.toColorIO().set("hsl.s", (c) => c * 0.8).coords,
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
    {
      name: "Jitter",
      effect: (color) => {
        const newChannels = [...color.toChannels()];
        const config = colorPickerConfig[colorSpace];
        const xStep = config.xStep;
        const yStep = config.yStep;
        const zStep = config.zStep;
        newChannels[config.xChannelIndex] += xStep * (Math.random() - 0.5);
        newChannels[config.yChannelIndex] += yStep * (Math.random() - 0.5);
        newChannels[config.zChannelIndex] += zStep * (Math.random() - 0.5);
        return newChannels as [number, number, number];
      },
    },
  ];
</script>

{#if focusedColors.length >= 1}
  <Tooltip bg="bg-white">
    <div slot="content" class="flex flex-col">
      {#each actions as action}
        <button
          class={simpleTooltipRowStyle}
          on:click={() => actionOnColor(focusedColors, action.effect)}
        >
          {action.name}
        </button>
      {/each}
    </div>
    <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
      Adjust Color{focusedColors.length > 1 ? "s" : ""}
    </button>
  </Tooltip>
{/if}
