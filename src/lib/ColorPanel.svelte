<script lang="ts">
  import ColorTune from "./ColorTune.svelte";
  import ColorPanelDot from "./ColorPanelDot.svelte";
  import colorStore from "./color-store";
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  <ColorTune />
  <div class="flex flex-wrap color-container">
    {#each $colorStore.currentPal as color, i}
      <ColorPanelDot {i} />
    {/each}
  </div>
</div>

<style>
  .color-container {
    flex-wrap: wrap;
    /* justify-content: space-evenly; */
    max-width: 640px;
  }
</style>
