<script lang="ts">
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import chroma from "chroma-js";
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  export let idx: number;
  export let color: Color;
  export let closeTooltip: () => void;
  $: colors = $colorStore.currentPal.colors;

  const swap = (arr: any[], i: number, j: number) => {
    const newArr = [...arr];
    const temp = newArr[i];
    newArr[i] = newArr[j];
    newArr[j] = temp;
    return newArr;
  };
  function updateColor(color: Color) {
    const updatedColors = [...colors];
    updatedColors[idx] = color;
    colorStore.setCurrentPalColors(updatedColors);
  }
</script>

<div class="flex mb-2">
  <input
    value={color.toHex()}
    on:change={(e) => {
      const newColor = chroma(e.target.value);
      updateColor(color.fromChroma(newColor));
    }}
  />
  {#if idx > 0}
    <button
      class="{buttonStyle} mr-2"
      on:click={() => {
        colorStore.setSort(swap(colors, idx, idx - 1));
        focusStore.setColors([idx - 1]);
      }}
    >
      Move forward
    </button>
  {/if}
  {#if idx < colors.length - 1}
    <button
      class="{buttonStyle} mr-2"
      on:click={() => {
        colorStore.setSort(swap(colors, idx, idx + 1));
        focusStore.setColors([idx + 1]);
      }}
    >
      Move backward
    </button>
  {/if}
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
  {#each ["lab", "hsv"] as colorMode}
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
