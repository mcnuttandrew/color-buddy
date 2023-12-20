<script lang="ts">
  import colorStore from "../stores/color-store";
  import SuggestName from "./context-free-tools/SuggestName.svelte";
  import AddFamiliarPal from "./context-free-tools/AddFamiliarPal.svelte";
  import SuggestColorPal from "./context-free-tools/SuggestColorPal.svelte";
  import SuggestColors from "./context-free-tools/SuggestColors.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import SuggestAdjustments from "./context-free-tools/SuggestAdjustments.svelte";
  import Background from "./Background.svelte";
  import Sort from "./context-free-tools/Sort.svelte";
  import GetColorsFromString from "./context-free-tools/GetColorsFromString.svelte";
</script>

<div class="bg-slate-400 p-2 w-96">
  <div class="text-4xl font-bold">Color Buddy</div>
  <div class="flex justify-between z-50">
    <div>
      <button on:click={() => colorStore.undo()}>Undo</button>
      <button on:click={() => colorStore.redo()}>Redo</button>
    </div>
    <div>
      {#each ["google", "openai"] as ai}
        <button
          class="underline ml-2"
          class:font-bold={ai === $colorStore.engine}
          on:click={() => {
            colorStore.setEngine(ai);
          }}
        >
          {ai}
        </button>
      {/each}
    </div>
  </div>

  <section class="mt-4 border-t-2 border-black">
    <div class="flex items-center justify-between">
      <span class="italic">Current Pal:</span>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
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
    <PalPreview pal={$colorStore.currentPal} />
    <Background />
    <GetColorsFromString />
    <div class="mt-5">
      <div>Actions</div>
      <button class="underline" on:click={() => colorStore.createNewPal()}>
        New Pal
      </button>
      <AddFamiliarPal />
      <SuggestName />
      <Sort />
      <SuggestColorPal />
      <SuggestAdjustments />
      <SuggestColors />
    </div>
  </section>
  <section class="mt-4 border-t-2 border-black">
    <div class="italic">Saved Pals</div>
    {#each $colorStore.palettes as pal}
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <div>{pal.name}</div>
          <div>
            <button
              class="underline"
              on:click={() => colorStore.startUsingPal(pal.name)}
            >
              Use
            </button>
            <button
              class="underline"
              on:click={() => colorStore.copyPal(pal.name)}
            >
              Copy
            </button>
            <button
              class="underline"
              on:click={() => colorStore.removePal(pal.name)}
            >
              Delete
            </button>
          </div>
        </div>
        <PalPreview {pal} />
      </div>
    {/each}
  </section>
</div>
