<script lang="ts">
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import chroma from "chroma-js";
  import { Color, colorFromHex } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  export let idx: number;
  export let color: Color;
  export let closeTooltip: () => void;
  $: colors = $colorStore.currentPal.colors;
  $: colorSpace = colors[0].spaceName || "lab";

  function updateColor(color: Color) {
    const updatedColors = [...colors];
    updatedColors[idx] = color;
    colorStore.setCurrentPalColors(updatedColors);
  }
  const modes = ["lab", "hsv"] as const;
</script>

<div class="flex mb-2">
  <input
    value={color.toHex()}
    on:change={(e) => {
      // @ts-ignore
      const newColor = chroma(e.target.value);
      updateColor(colorFromHex(newColor.hex(), colorSpace));
    }}
  />

  <button
    class="{buttonStyle} mr-2"
    on:click={() => {
      colorStore.setCurrentPalColors(colors.filter((_, jdx) => jdx !== idx));
      focusStore.removeColor(idx);
      closeTooltip();
    }}
  >
    Delete
  </button>
</div>
<div class="flex">
  {#each modes as colorMode}
    <ColorChannelPicker
      {color}
      {colorMode}
      onColorChange={(color) => {
        const updatedColors = [...colors];
        updatedColors[idx] = color;
        colorStore.setCurrentPalColors(updatedColors);
      }}
    />
  {/each}
</div>

<style>
  input {
    width: 100px;
  }
</style>
