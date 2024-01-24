<script lang="ts">
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  import { swap } from "../lib/utils";
  export let idx: number;
  export let color: Color;
  export let closeTooltip: () => void;
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorSpace = currentPal.colorSpace;

  function updateColor(color: Color) {
    const updatedColors = [...colors];
    updatedColors[idx] = color;
    colorStore.setCurrentPalColors(updatedColors);
  }
  let modes = ["lab", "hsv"] as any;
</script>

<div class="px-4 pb-4 pt-2">
  <div class="flex mb-2">
    <input
      value={color.toHex()}
      on:change={(e) => {
        // @ts-ignore
        updateColor(Color.colorFromString(e.target.value, colorSpace));
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
    {#if idx > 0}
      <button
        class="{buttonStyle} mr-2"
        on:click|stopPropagation|preventDefault={() => {
          colorStore.setSort(swap(colors, idx, idx - 1));
          focusStore.setColors([idx - 1]);
          idx = idx - 1;
        }}
      >
        Move forward
      </button>
    {/if}
    {#if idx < colors.length - 1}
      <button
        class="{buttonStyle} mr-2"
        on:click|stopPropagation|preventDefault={() => {
          colorStore.setSort(swap(colors, idx, idx + 1));
          focusStore.setColors([idx + 1]);
          idx = idx + 1;
        }}
      >
        Move backward
      </button>
    {/if}
  </div>
  <div class="flex">
    {#each modes as colorMode, jdx}
      <div class="flex flex-col">
        <ColorChannelPicker
          color={color.toColorSpace(colorMode)}
          {colorMode}
          onColorChange={(color) => {
            const updatedColors = [...colors];
            updatedColors[idx] = color;
            colorStore.setCurrentPalColors(updatedColors);
          }}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  input {
    width: 100px;
  }
</style>
