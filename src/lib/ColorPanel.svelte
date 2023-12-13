<script lang="ts">
  import ColorTune from "./ColorTune.svelte";
  import ColorPanelDot from "./ColorPanelDot.svelte";
  import BackgroundPicker from "./BackgroundPicker.svelte";
  import colorStore from "./color-store";
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  <div class="flex">
    <ColorTune />
    <BackgroundPicker />
  </div>
  <div
    class="flex flex-wrap color-container border-2 border-slate-300 rounded"
    style="background-color: {$colorStore.currentPal.background};"
  >
    {#each $colorStore.currentPal.colors as color, i}
      <ColorPanelDot {i} />
    {/each}
  </div>
</div>

<style>
  .color-container {
    max-width: 640px;
  }
</style>
