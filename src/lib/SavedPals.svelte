<script lang="ts">
  import { store } from "./store";
  import chroma from "chroma-js";

  const colorClass = "w-6 h-6 mx-2 rounded-full";
</script>

<div class="bg-slate-400 p-2 w-96">
  <div class="text-4xl font-bold">Color Buddy</div>

  <section class="mt-4 border-t-2 border-black">
    <button class="underline" on:click={() => store.createNewPal()}>
      Save Current Pal and create new one
    </button>
  </section>
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
            $store.mostRecentPal = e.target.textContent;
          }}
          contenteditable="true"
        >
          {$store.mostRecentPal}
        </div>
      </div>
    </div>
    <div class="flex flex-wrap bg-white rounded p-2">
      {#each $store.currentPal as color}
        <div
          class={colorClass}
          class:text-white={chroma(color).luminance() < 0.5}
          style="background-color: {color}"
        ></div>
      {/each}
    </div>
    <div class="flex">
      <span>Name:</span>
    </div>
    <button class="underline">Suggest a name</button>
    <input
      class="w-full h-5"
      value={$store.currentPal.join(", ")}
      on:change={(e) => {
        console.log(e.target.value);
      }}
    />
  </section>
  <section class="mt-4 border-t-2 border-black">
    <div class="italic">Saved Pals</div>
    {#each $store.palettes as pal}
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <div>{pal.name}</div>
          <div>
            <button
              class="underline"
              on:click={() => store.startUsingPal(pal.name)}
            >
              Use
            </button>
            <button
              class="underline"
              on:click={() => store.removePal(pal.name)}
            >
              Delete
            </button>
          </div>
        </div>
        <div class="flex flex-wrap bg-white rounded p-2">
          {#each pal.palette as color}
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
