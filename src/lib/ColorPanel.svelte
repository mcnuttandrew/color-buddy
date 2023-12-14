<script lang="ts">
  import { flip } from "svelte/animate";
  import ColorPanelDot from "./ColorPanelDot.svelte";
  import ColorChannelPicker from "./ColorChannelPicker.svelte";
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  <div class="flex">
    <ColorChannelPicker
      heading="Background"
      color={$colorStore.currentPal.background}
      onColorChange={(color) => {
        colorStore.setBackground(color);
      }}
    />
    {#if !!$focusStore.focusedColor}
      <ColorChannelPicker
        heading="Focused Color"
        color={$focusStore.focusedColor}
        onColorChange={(color) => {
          colorStore.replaceColor($focusStore.focusedColor, color);
          focusStore.setFocusedColor(color);
        }}
      />
    {/if}
  </div>
  <div
    class="flex flex-wrap color-container border-2 border-slate-300 rounded"
    style="background-color: {$colorStore.currentPal.background};"
  >
    {#each $colorStore.currentPal.colors as color, i (color)}
      <div animate:flip={{ duration: 400 }}>
        <ColorPanelDot {i} />
      </div>
    {/each}
  </div>
</div>

<style>
  .color-container {
    max-width: 640px;
  }
</style>
