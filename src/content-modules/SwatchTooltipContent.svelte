<script lang="ts">
  import ColorNameWithEdit from "../components/ColorNameWithEdit.svelte";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
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
</script>

<ColorNameWithEdit
  {color}
  onColorChange={(color) => {
    const updatedColors = [...colors];
    updatedColors[idx] = color;
    colorStore.setCurrentPalColors(updatedColors);
  }}
/>

<div class="flex">
  {#each ["lab"] as colorMode}
    <!-- <ColorChannelPicker
      {color}
      {colorMode}
      onColorChange={(color) => {
        const updatedColors = [...colors];
        updatedColors[idx] = color;
        colorStore.setCurrentPalColors(updatedColors);
      }}
    /> -->
  {/each}
</div>
<div class="flex">
  {#if idx > 0}
    <button
      class="underline mr-2"
      on:click={() => {
        colorStore.setSort(swap(colors, idx, idx - 1));
      }}
    >
      Move forward
    </button>
  {/if}
  {#if idx < colors.length - 1}
    <button
      class="underline mr-2"
      on:click={() => {
        colorStore.setSort(swap(colors, idx, idx + 1));
      }}
    >
      Move backward
    </button>
  {/if}
  <button
    class="underline mr-2"
    on:click={() => {
      colorStore.setCurrentPalColors(colors.filter((_, jdx) => jdx !== idx));
      focusStore.removeColor(idx);
      closeTooltip();
    }}
  >
    Delete
  </button>
</div>
