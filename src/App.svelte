<script lang="ts">
  import { store } from "./lib/store";
  import { charts, buildTheme } from "./charts";
  import Vega from "./lib/Vega.svelte";
  import ColorArea from "./lib/ColorArea.svelte";
  import SavedPals from "./lib/SavedPals.svelte";
  import ColorCircle from "./lib/ColorCircle.svelte";
  import ColorPanel from "./lib/ColorPanel.svelte";
  import TinyWebpage from "./lib/TinyWebpage.svelte";
  import TextBlock from "./lib/TextBlock.svelte";
</script>

<main class="flex h-full">
  <SavedPals />
  <div class="w-full flex p-2">
    <!-- left column -->
    <div class="flex-col w-1/2">
      <div class="flex">
        <ColorCircle height={300} width={300} />
        <ColorArea height={300} width={300} />
      </div>
      <ColorPanel />
    </div>
    <!-- right colum -->
    <div class=" w-1/2">
      <h1>Visualizations</h1>
      <div class="flex flex-wrap overflow-auto">
        {#each charts as spec}
          <Vega
            theme={buildTheme($store.currentPal)}
            spec={spec($store.currentPal)}
          />
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
