<script lang="ts">
  import ColorChannelPicker from "./ColorChannelPicker.svelte";
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
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
