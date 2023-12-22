<script lang="ts">
  import focusStore from "../stores/focus-store";

  import DeleteSelection from "./contextual-tools/DeleteSelection.svelte";
  import AlignSelection from "./contextual-tools/AlignSelection.svelte";
  import CreateAverage from "./contextual-tools/CreateAverage.svelte";
  import SuggestionModificationToSelection from "./contextual-tools/SuggestionModificationToSelection.svelte";
  import InterpolatePoints from "./contextual-tools/InterpolatePoints.svelte";
  import DistributePoints from "./contextual-tools/DistributePoints.svelte";
  import { buttonStyle } from "../lib/styles";
  import AdjustColor from "./contextual-tools/AdjustColor.svelte";
  import OpposingColor from "./contextual-tools/OpposingColor.svelte";
  import AddColor from "./contextual-tools/AddColor.svelte";

  $: focusedColors = $focusStore.focusedColors;
</script>

<div class="flex flex-col bg-slate-400 w-full p-2 h-12">
  <div class="flex">
    <AddColor />
    <AdjustColor />
    <OpposingColor />

    <CreateAverage />
    <SuggestionModificationToSelection />
    <InterpolatePoints />
    <DistributePoints />

    <AlignSelection />
    {#if focusedColors.length > 0}
      <div>
        <button class={buttonStyle} on:click={() => focusStore.clearColors()}>
          Clear Selection
        </button>
      </div>
    {/if}
    <DeleteSelection />
  </div>
</div>

<style>
  .action-area {
    min-width: 300px;
  }
</style>
