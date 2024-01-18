<script lang="ts">
  import { Color, colorFromChannels } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = $colorStore.currentPal.colorSpace;

  type ColorEffect = (color: Color) => [number, number, number];
  function actionOnColor(idx: number, action: ColorEffect) {
    const channels = action(colors[idx]);
    console.log(channels);
    const newColors = [...colors];
    newColors[idx] = colorFromChannels(channels, colorSpace);
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
  ];
</script>

{#if focusedColors.length === 1}
  <Tooltip>
    <div slot="content">
      {#each actions as action}
        <button
          class={buttonStyle}
          on:click={() => actionOnColor(focusedColors[0], action.effect)}
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
