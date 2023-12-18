<script lang="ts">
  import { flip } from "svelte/animate";
  import colorStore from "../stores/color-store";
  const colorClass = "w-6 h-6 mx-2 rounded-full";
  import SuggestName from "./actions-components/SuggestName.svelte";
  import AddFamiliarPal from "./actions-components/AddFamiliarPal.svelte";
  $: colors = $colorStore.currentPal.colors || [];
</script>

<div class="bg-slate-400 p-2 w-96">
  <div class="text-4xl font-bold">Color Buddy</div>
  <div>
    <button on:click={() => colorStore.undo()}>Undo</button>
    <button on:click={() => colorStore.redo()}>Redo</button>
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
    <div
      class="flex flex-wrap rounded p-2"
      style="background-color: {$colorStore.currentPal.background.toHex()};"
    >
      {#each colors as color (color)}
        <div
          animate:flip={{ duration: 200 }}
          class={colorClass}
          class:text-white={color.toChroma().luminance() < 0.5}
          style="background-color: {color.toHex()}"
        ></div>
      {/each}
    </div>

    <div class="mt-5">
      <label for="current-colors">Current Colors</label>
      <textarea
        id="current-colors"
        class="w-full p-2 rounded"
        value={colors.map((color) => color.toHex()).join(", ")}
        on:change={(e) => {
          console.log("TODO");
          // console.log(e.target.value);
        }}
      />
    </div>

    <div class="mt-5">
      <div>Actions</div>
      <button class="underline" on:click={() => colorStore.createNewPal()}>
        Save Current Pal and create new one
      </button>

      <SuggestName />
      <button class="underline" on:click={() => colorStore.randomizeOrder()}>
        Randomize order
      </button>
      <button class="underline" on:click={() => colorStore.sortByHue()}>
        Sort by hue
      </button>
      <AddFamiliarPal />
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
        <div
          class="flex flex-wrap rounded p-2"
          style="background-color: {pal.background.toHex()};"
        >
          {#each pal.colors as color}
            <div
              class={colorClass}
              class:text-white={color.toChroma().luminance() < 0.5}
              style="background-color: {color.toHex()}"
            ></div>
          {/each}
        </div>
      </div>
    {/each}
  </section>
</div>
