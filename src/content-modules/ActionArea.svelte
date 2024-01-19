<script lang="ts">
  import DeleteSelection from "./contextual-tools/DeleteSelection.svelte";
  import AlignSelection from "./contextual-tools/AlignSelection.svelte";
  import CreateAverage from "./contextual-tools/CreateAverage.svelte";
  import SuggestionModificationToSelection from "./contextual-tools/SuggestionModificationToSelection.svelte";
  import InterpolatePoints from "./contextual-tools/InterpolatePoints.svelte";
  import DistributePoints from "./contextual-tools/DistributePoints.svelte";
  import AdjustColor from "./contextual-tools/AdjustColor.svelte";
  import AddColor from "./contextual-tools/AddColor.svelte";
  import Rotate from "./contextual-tools/Rotate.svelte";
  import Deduplicate from "./contextual-tools/Deduplicate.svelte";
</script>

<div
  class="flex bg-slate-400 p-2 h-12 flex-none items-center overflow-x-scroll overflow-y-hidden"
>
  <AddColor />
  <AdjustColor />

  <CreateAverage />
  <SuggestionModificationToSelection />
  <InterpolatePoints />
  <DistributePoints />
  <Rotate />

  <AlignSelection />

  <DeleteSelection />
  <Deduplicate />
</div>
