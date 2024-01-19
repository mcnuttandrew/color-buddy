<script lang="ts">
  import colorStore from "../stores/color-store";
  import AddFamiliarPal from "./context-free-tools/AddFamiliarPal.svelte";
  import SuggestColorPal from "./context-free-tools/SuggestColorPal.svelte";

  import Config from "./context-free-tools/Config.svelte";
  import { buttonStyle } from "../lib/styles";

  import SavedPals from "./SavedPals.svelte";
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
      <button
        class={buttonStyle}
        on:click={() => {
          const newPal = {
            ...$colorStore.currentPal,
            name: `${$colorStore.currentPal.name} copy`,
            colors: [...$colorStore.currentPal.colors],
          };
          colorStore.createNewPal(newPal);
        }}
      >
        Save
      </button>
      <SuggestColorPal />
    </div>
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
