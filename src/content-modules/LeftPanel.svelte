<script lang="ts">
  import colorStore from "../stores/color-store";
  import SuggestName from "./context-free-tools/SuggestName.svelte";
  import AddFamiliarPal from "./context-free-tools/AddFamiliarPal.svelte";
  import SuggestColorPal from "./context-free-tools/SuggestColorPal.svelte";

  import PalPreview from "../components/PalPreview.svelte";
  import Background from "./Background.svelte";
  import Sort from "./context-free-tools/Sort.svelte";
  import GetColorsFromString from "./context-free-tools/GetColorsFromString.svelte";
  import Config from "./context-free-tools/Config.svelte";
  import { buttonStyle } from "../lib/styles";
  import ShortCuts from "./context-free-tools/ShortCuts.svelte";
  import Zoom from "./context-free-tools/Zoom.svelte";

  import SavedPals from "./SavedPals.svelte";
  import SetColorSpace from "./SetColorSpace.svelte";
</script>

<!-- left panel -->
<div class="bg-slate-400 p-2 w-80 container flex flex-col h-full flex-none">
  <section class="flex flex-col flex-none">
    <div class="text-4xl font-bold">Color Buddy</div>
    <div class="flex justify-between z-50">
      <div>
        <button class={buttonStyle} on:click={() => colorStore.undo()}>
          Undo
        </button>
        <button class={buttonStyle} on:click={() => colorStore.redo()}>
          Redo
        </button>
      </div>
      <Config />
    </div>
    <div class="flex">
      <AddFamiliarPal />
      <SuggestColorPal />
      <ShortCuts />
    </div>
  </section>

  <section class="mt-4 border-t-2 border-black flex flex-col flex-none">
    <div class="">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="flex justify-between">
        <span class="italic">Current Pal:</span>
        <div class="flex">
          <span>✎</span>
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
      <div class="flex justify-between">
        <SuggestName />
        <Sort />
      </div>
    </div>
    <PalPreview pal={$colorStore.currentPal} />

    <Background />
    <Zoom />
    <GetColorsFromString />
    <SetColorSpace />
  </section>
  <section
    class="mt-4 border-t-2 border-black flex flex-col flex-1 overflow-auto"
  >
    <div class="italic">Saved Pals</div>
    <SavedPals />
  </section>
</div>

<style>
  .container {
    min-width: 300px;
  }
</style>
