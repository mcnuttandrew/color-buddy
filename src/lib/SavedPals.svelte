<script lang="ts">
  import colorStore from "./color-store";
  import { actionButton } from "../styles";
  import chroma from "chroma-js";
  const colorClass = "w-6 h-6 mx-2 rounded-full";
  import SuggestName from "./actions-components/SuggestName.svelte";
  $: colors = $colorStore.currentPal.colors || [];
</script>

<div class="bg-slate-400 p-2 w-96">
  <div class="text-4xl font-bold">Color Buddy</div>

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
      style="background-color: {$colorStore.currentPal.background};"
    >
      {#each colors as color}
        <div
          class={colorClass}
          class:text-white={chroma(color).luminance() < 0.5}
          style="background-color: {color}"
        ></div>
      {/each}
    </div>

    <div class="mt-5">
      <label for="current-colors">Current Colors</label>
      <textarea
        id="current-colors"
        class="w-full p-2 rounded"
        value={colors.join(", ")}
        on:change={(e) => {
          console.log("TODO");
          // console.log(e.target.value);
        }}
      />
    </div>

    <div class="mt-5">
      <div>Actions</div>
      <button class={actionButton} on:click={() => colorStore.createNewPal()}>
        Save Current Pal and create new one
      </button>

      <SuggestName />
      <button class={actionButton} on:click={() => colorStore.randomizeOrder()}>
        Randomize order
      </button>
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
          style="background-color: {pal.background};"
        >
          {#each pal.colors as color}
            <div
              class={colorClass}
              class:text-white={chroma(color).luminance() < 0.5}
              style="background-color: {color}"
            ></div>
          {/each}
        </div>
      </div>
    {/each}
  </section>
</div>
