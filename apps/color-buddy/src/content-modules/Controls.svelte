<script lang="ts">
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
    <Rotate />
    <InterpolatePoints />
  </div>
</div>
