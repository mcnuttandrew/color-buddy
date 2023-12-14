<script lang="ts">
  import colorStore from "./lib/color-store";
  import { charts, buildTheme } from "./charts";
  import Vega from "./lib/Vega.svelte";
  import ColorArea from "./lib/ColorArea.svelte";
  import SavedPals from "./lib/SavedPals.svelte";
  import ColorPanel from "./lib/ColorPanel.svelte";
  import TinyWebpage from "./lib/TinyWebpage.svelte";
  import TextBlock from "./lib/TextBlock.svelte";
  import SuggestionsPanel from "./lib/SuggestionsPanel.svelte";

  let showOption: Record<string, boolean> = {
    swatches: true,
    visualizations: true,
    pages: true,
  };
</script>

<main class="flex h-full">
  <SavedPals />
  <div class="w-full flex p-2">
    <!-- left column -->
    <div class="flex-col w-1/2">
      <div class="flex">
        <!-- <ColorCircle height={300} width={300} /> -->
        <ColorArea height={400} width={400} />
      </div>
      <ColorPanel />
      <SuggestionsPanel />
      <h1>Evaluation</h1>
      <div>TODO</div>
    </div>
    <!-- right colum -->
    <div class=" w-1/2">
      <div>
        {#each Object.keys(showOption) as key}
          <label class="relative inline-flex items-center cursor-pointer mr-10">
            <input
              type="checkbox"
              value=""
              class="sr-only peer"
              bind:checked={showOption[key]}
            />
            <div
              class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
            <span
              class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {key}
            </span>
          </label>
        {/each}
      </div>
      {#if showOption.swatches}
        <h1>Swatches</h1>
        <div>TODO</div>
      {/if}
      {#if showOption.visualizations}
        <h1>Visualizations</h1>
        <div class="flex flex-wrap overflow-auto">
          {#each charts as spec}
            <Vega
              theme={buildTheme($colorStore.currentPal)}
              spec={spec($colorStore.currentPal)}
            />
          {/each}
        </div>
      {/if}
      {#if showOption.pages}
        <h1>Web pages</h1>
        <div class="flex flex-wrap overflow-auto">
          <TinyWebpage />
          <TextBlock />
        </div>
      {/if}
    </div>
  </div>
</main>
