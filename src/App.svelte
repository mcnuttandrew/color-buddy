<script lang="ts">
  import colorStore from "./stores/color-store";
  import { charts } from "./lib/charts";
  import Vega from "./components/Vega.svelte";
  import ColorArea from "./content-modules/ColorArea.svelte";
  import SavedPals from "./content-modules/SavedPals.svelte";
  import ActionArea from "./content-modules/ActionArea.svelte";
  import TinyWebpage from "./content-modules/TinyWebpage.svelte";
  import TextBlock from "./content-modules/TextBlock.svelte";
  import Swatches from "./content-modules/Swatches.svelte";
  import Eval from "./content-modules/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";

  let state: "swatches" | "eval" = "swatches";

  $: bg = $colorStore.currentPal.background;
</script>

<main class="flex h-full">
  <SavedPals />
  <div class="w-full flex-fol">
    <!-- left column -->
    <div class="flex flex-col w h-1/2">
      <div class="flex p-2">
        <div class="w-full flex">
          <ColorArea height={450} width={450} />
        </div>
        <div class="w-full">
          <nav aria-label="Page navigation">
            <ul class="inline-flex">
              {#each ["swatches", "eval"] as tab}
                <li>
                  <button
                    class="h-6 px-2 transition-colors duration-150 border border-slate-500 focus:shadow-outline"
                    class:bg-slate-500={state === tab}
                    class:bg-white={state !== tab}
                    class:text-white={state === tab}
                    class:rounded-r-lg={tab === "eval"}
                    class:rounded-l-lg={tab === "swatches"}
                    on:click={() => {
                      state = tab;
                    }}
                  >
                    {tab}
                  </button>
                </li>
              {/each}
            </ul>
          </nav>

          {#if state === "swatches"}
            <Swatches />
          {:else}
            <Eval />
          {/if}
        </div>
      </div>
      <ActionArea />
    </div>
    <!-- right colum -->
    <div
      class=" h-1/2 flex-col flex flex-wrap overflow-auto p-4"
      style={`background-color: ${bg.toHex()}`}
    >
      <TinyWebpage />
      <TextBlock />
      {#each charts as spec}
        <Vega spec={spec($colorStore.currentPal)} />
      {/each}
    </div>
  </div>
</main>

<KeyboardHooks />
