<script lang="ts">
  import colorStore from "./stores/color-store";
  import focusStore from "./stores/focus-store";
  import navStore from "./stores/nav-store";
  import LeftPanel from "./content-modules/LeftPanel.svelte";
  import ActionArea from "./content-modules/ActionArea.svelte";
  import Examples from "./content-modules/Examples.svelte";
  import Eval from "./content-modules/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  import ComparePal from "./content-modules/ComparePal.svelte";
  import ColorScatterPlot from "./components/ColorScatterPlot.svelte";

  const tabs = ["examples", "compare", "eval"] as const;
</script>

<main class="flex h-full">
  <LeftPanel />
  <div class="h-full flex flex-col grow main-content">
    <ActionArea />
    <div class="flex w-full grow overflow-auto">
      <div style="margin-top: 43px;" class="flex flex-col p-2 h-full">
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
                  class:bg-slate-500={$navStore.route === tab}
                  class:bg-white={$navStore.route !== tab}
                  class:text-white={$navStore.route === tab}
                  class:rounded-r-lg={tab === "eval"}
                  class:rounded-l-lg={tab === "examples"}
                  on:click={() => navStore.setRoute(tab)}
                >
                  {tab}
                </button>
              </li>
            {/each}
          </ul>
        </nav>

        {#if $navStore.route === "examples"}
          <Examples />
        {:else if $navStore.route === "compare"}
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
