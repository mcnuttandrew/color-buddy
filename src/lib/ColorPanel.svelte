<script lang="ts">
  import chroma from "chroma-js";
  import { insert, deleteFrom, randColor, avgColors } from "../utils";
  import { store } from "./store";
  $: colors = $store.currentPal;
  $: computedGuess = [
    randColor(),
    avgColors(colors, "rgb"),
    avgColors(colors, "hsl"),
    // avgColors(colors, "lab"),
  ];
</script>

<div class="flex color-container">
  {#each colors as color, i}
    <div>
      <div
        class="w-32 h-32 text-center flex flex-col justify-center items-center rounded-full"
        style="background-color: {color}"
      >
        <div>
          <button
            on:click={() => store.setCurrentPal(insert(colors, randColor(), i))}
          >
            🔀
          </button>
          <button on:click={() => store.setCurrentPal(deleteFrom(colors, i))}>
            ␡
          </button>
        </div>
        <div
          class:text-white={chroma(color).luminance() < 0.5}
          bind:textContent={color}
          contenteditable="true"
        >
          {color}
        </div>
      </div>
    </div>

    <div></div>
  {/each}
  <div class="w-32 h-32 text-center flex justify-center items-center">
    {#each computedGuess as color, i}
      <button
        class="w-8 h-8 rounded-full"
        style="background-color: {color}"
        on:click={() => store.setCurrentPal(insert(colors, color))}
      >
        +
      </button>
    {/each}
  </div>
</div>

<style>
  .color-container {
    flex-wrap: wrap;
    /* justify-content: space-evenly; */
    max-width: 640px;
  }
</style>
