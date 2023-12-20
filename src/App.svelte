<script lang="ts">
  import colorStore from "./stores/color-store";
  import { charts } from "./lib/charts";
  import Vega from "./components/Vega.svelte";
  import ColorArea from "./content-modules/ColorArea.svelte";
  import SavedPals from "./content-modules/SavedPals.svelte";
  import ColorPanel from "./content-modules/ActionArea.svelte";
  import TinyWebpage from "./content-modules/TinyWebpage.svelte";
  import TextBlock from "./content-modules/TextBlock.svelte";
  import SuggestionsPanel from "./content-modules/SuggestionsPanel.svelte";
  import Swatches from "./content-modules/Swatches.svelte";
  import Tooltip from "./components/Tooltip.svelte";
  import ColorChannelPicker from "./components/ColorChannelPicker.svelte";
  import ColorNameWithEdit from "./components/ColorNameWithEdit.svelte";

  $: bg = $colorStore.currentPal.background;
</script>

<main class="flex h-full">
  <SavedPals />
  <div class="w-full flex p-2">
    <!-- left column -->
    <div class="flex-col w-1/2">
      <ColorPanel />
      <div class="flex">
        <!-- <ColorCircle height={300} width={300} /> -->
        <ColorArea height={400} width={400} />
      </div>
      <Swatches />

      <SuggestionsPanel />
      <h1>Evaluation</h1>
      <div>TODO</div>
    </div>
    <!-- right colum -->
    <div class=" w-1/2">
      <h1>Visualizations</h1>
      <div
        class="flex flex-wrap overflow-auto p-4"
        style={`background-color: ${bg.toHex()}`}
      >
        {#each charts as spec}
          <Vega spec={spec($colorStore.currentPal)} />
        {/each}
      </div>
      <h1>Web pages</h1>
      <div class="flex flex-wrap overflow-auto">
        <TinyWebpage />
        <TextBlock />
      </div>
    </div>
  </div>
</main>
