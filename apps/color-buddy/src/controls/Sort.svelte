<script lang="ts">
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  const spaces = ["lab", "lch", "hsl", "hsv"];
  let selectedColorSpace: (typeof spaces)[number] = "lab";
  let selectedLetter = "a";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;

  function sortByChannel(colorSpace: string, channel: number) {
    const newSort = [...colors].sort((a, b) => {
      const aVal = a.toColorIO().to(colorSpace).coords[channel];
      const bVal = b.toColorIO().to(colorSpace).coords[channel];
      return aVal - bVal;
    });
    colorStore.setSort(newSort);
  }
</script>

<Tooltip>
  <span slot="content" let:onClick>
    <div class="flex flex-col">
      <div class="font-bold">Sort By Channel</div>
      <div class="flex">
        <div>
          Color Space:
          <select
            bind:value={selectedColorSpace}
            on:click={(e) => e.stopPropagation()}
            class="text-black"
          >
            {#each spaces as space}
              <option value={space}>{space}</option>
            {/each}
          </select>
        </div>
        <div class="">
          Channel:
          <select
            bind:value={selectedLetter}
            on:click={(e) => e.stopPropagation()}
            class="text-black"
          >
            {#each selectedColorSpace.split("") as letter}
              <option value={letter}>{letter}</option>
            {/each}
          </select>
        </div>
      </div>
      <button
        class={buttonStyle}
        on:click={() =>
          sortByChannel(
            selectedColorSpace,
            selectedColorSpace.indexOf(selectedLetter)
          )}
      >
        Do Sort
      </button>
    </div>
    <div class="font-bold">Other Sorts</div>
    <button
      class={buttonStyle}
      on:click={() =>
        colorStore.setSort([...colors].sort(() => Math.random() - 0.5))}
    >
      Randomize order
    </button>
    <button
      class={buttonStyle}
      on:click={() => colorStore.setSort([...colors].reverse())}
    >
      Reverse order
    </button>
  </span>

  <button
    slot="target"
    id="sort-button"
    let:toggle
    class={buttonStyle}
    on:click={toggle}
  >
    Sort
  </button>
</Tooltip>

<style>
  #sort-button {
    top: -2px;
    position: relative;
  }
</style>
