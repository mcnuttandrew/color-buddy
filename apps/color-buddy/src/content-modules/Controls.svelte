<script lang="ts">
  import focusStore from "../stores/focus-store";
  import AdjustColor from "../controls/AdjustColor.svelte";
  import AlignSelection from "../controls/AlignSelection.svelte";
  import DistributePoints from "../controls/DistributePoints.svelte";
  import InterpolatePoints from "../controls/InterpolatePoints.svelte";
  import Rotate from "../controls/Rotate.svelte";
</script>

<div class="flex flex-col">
  <div class="text-sm">Controls</div>
  <div class="flex">
    <AdjustColor />
    <DistributePoints />
    <AlignSelection />
    <!-- use this to try to quash the rotation/selection bug -->
    {#if $focusStore.focusedColors.length > 1}
      <Rotate />
    {/if}
    <InterpolatePoints />
  </div>
</div>
