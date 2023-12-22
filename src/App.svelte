<script lang="ts">
  import ColorArea from "./content-modules/ColorArea.svelte";
  import SavedPals from "./content-modules/SavedPals.svelte";
  import ActionArea from "./content-modules/ActionArea.svelte";
  import Examples from "./content-modules/Examples.svelte";
  import Swatches from "./content-modules/Swatches.svelte";
  import Eval from "./content-modules/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";

  let state: "swatches" | "eval" = "eval";
</script>

<main class="flex h-full">
  <SavedPals />
  <div class="w-full flex-fol h-full">
    <ActionArea />
    <!-- top row -->
    <div class="flex flex-col h-1/2">
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
    </div>
    <!-- bottom row -->
    <Examples />
  </div>
</main>

<KeyboardHooks />
