<script lang="ts">
  import colorStore from "./stores/color-store";
  import focusStore from "./stores/focus-store";
  import configStore from "./stores/config-store";

  import LeftPanel from "./content-modules/LeftPanel.svelte";
  import ActionArea from "./content-modules/ActionArea.svelte";
  import Examples from "./content-modules/Examples.svelte";
  import Eval from "./content-modules/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  import ComparePal from "./content-modules/ComparePal.svelte";
  import ColorScatterPlot from "./components/ColorScatterPlot.svelte";
  import SetSimulation from "./content-modules/context-free-tools/SetSimulation.svelte";
  import Zoom from "./content-modules/context-free-tools/Zoom.svelte";
  import Background from "./content-modules/Background.svelte";
  import SetColorSpace from "./content-modules/contextual-tools/SetColorSpace.svelte";
  import PalPreview from "./components/PalPreview.svelte";
  import Sort from "./content-modules/context-free-tools/Sort.svelte";
  import SuggestName from "./content-modules/context-free-tools/SuggestName.svelte";
  import GetColorsFromString from "./content-modules/context-free-tools/GetColorsFromString.svelte";

  const tabs = ["examples", "compare", "eval"] as const;
</script>

<main class="flex h-full">
  <LeftPanel />
  <div class="h-full flex flex-col grow main-content">
    <ActionArea />
    <div class="flex w-full grow overflow-auto">
      <div class="flex flex-col">
        <div class="w-full flex bg-slate-100 px-2 py-3">
          <SetSimulation />
          <Zoom />
          <Background />
          <SetColorSpace />
        </div>
        <div class="flex flex-col h-full">
          <ColorScatterPlot
            scatterPlotMode="moving"
            colorSpace={$colorStore.currentPal.colors[0].spaceName}
            Pal={$colorStore.currentPal}
            focusedColors={$focusStore.focusedColors}
            height={450}
            width={450}
            onColorsChange={(x) => colorStore.setCurrentPalColors(x)}
            onFocusedColorsChange={(x) => focusStore.setColors(x)}
            startDragging={() => colorStore.pausePersistance()}
            stopDragging={() => colorStore.resumePersistance()}
          />
          <div class="flex flex-col pl-2">
            <!-- naming stuff -->
            <div class="flex justify-between">
              <div class="flex">
                <span class="italic">Current Pal:</span>
                <div class="flex">
                  <span>✎</span>
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <div
                    class=""
                    on:keyup={(e) => {
                      // @ts-ignore
                      colorStore.setCurrentPalName(e.target.textContent);
                    }}
                    contenteditable="true"
                  >
                    {$colorStore.currentPal.name}
                  </div>
                </div>
              </div>
              <SuggestName />
            </div>
            <!-- overview / preview -->
            <div class="flex w-full items-center">
              <PalPreview pal={$colorStore.currentPal} />
              <div class="pl-2">
                <Sort />
              </div>
            </div>
            <GetColorsFromString />
          </div>
        </div>
      </div>
      <div class="grow">
        <nav
          aria-label="Page navigation"
          class="bg-slate-100 flex justify-center"
        >
          <ul class="inline-flex">
            {#each tabs as tab}
              <li>
                <button
                  class="h-6 px-2 transition-colors duration-150 border border-slate-500 focus:shadow-outline uppercase italic"
                  class:bg-slate-500={$configStore.route === tab}
                  class:bg-white={$configStore.route !== tab}
                  class:text-white={$configStore.route === tab}
                  class:rounded-r-lg={tab === "eval"}
                  class:rounded-l-lg={tab === "examples"}
                  on:click={() => configStore.setRoute(tab)}
                >
                  {tab}
                </button>
              </li>
            {/each}
          </ul>
        </nav>

        {#if $configStore.route === "examples"}
          <Examples />
        {:else if $configStore.route === "compare"}
          <ComparePal />
        {:else}
          <Eval />
        {/if}
      </div>
    </div>
    <!-- bottom row -->
  </div>
</main>

<KeyboardHooks />

<style>
  .main-content {
    min-width: 0;
  }
</style>
