<script lang="ts">
  import colorStore from "./stores/color-store";
  import focusStore from "./stores/focus-store";
  import navStore from "./stores/nav-store";
  import SavedPals from "./content-modules/SavedPals.svelte";
  import ActionArea from "./content-modules/ActionArea.svelte";
  import Examples from "./content-modules/Examples.svelte";
  import Swatches from "./content-modules/Swatches.svelte";
  import Eval from "./content-modules/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  import ComparePal from "./content-modules/ComparePal.svelte";
  import ColorScatterPlot from "./components/ColorScatterPlot.svelte";
</script>

<main class="flex h-full">
  <SavedPals />
  <div class="w-full h-full">
    <ActionArea />
    <div class="flex flex-col w-full h-full">
      <div class="flex h-full">
        <div style="margin-top: 43px;" class="flex flex-col p-2">
          <ColorScatterPlot
            colorSpace={$colorStore.currentPal.colors[0].spaceName}
            Pal={$colorStore.currentPal}
            focusedColors={$focusStore.focusedColors}
            height={450}
            width={450}
            onColorsChange={(x) => colorStore.setCurrentPalColors(x)}
            onFocusedColorsChange={(x) => focusStore.setColors(x)}
          />
          <Swatches />
        </div>
        <div class="h-full">
          <nav
            aria-label="Page navigation"
            class="bg-slate-100 flex justify-center"
          >
            <ul class="inline-flex">
              {#each ["examples", "compare", "eval"] as tab}
                <li>
                  <button
                    class="h-6 px-2 transition-colors duration-150 border border-slate-500 focus:shadow-outline"
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
    </div>
    <!-- bottom row -->
  </div>
</main>

<KeyboardHooks />
