<script lang="ts">
  import colorStore from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  const spaces = ["lab", "lch", "rgb", "hsl", "hsv"];
  let selectedColorSpace: (typeof spaces)[number] = "lab";
  let selectedLetter = "a";
</script>

<Tooltip>
  <span slot="content" let:onClick>
    <button class={buttonStyle} on:click={() => colorStore.randomizeOrder()}>
      Randomize order
    </button>
    <select bind:value={selectedColorSpace}>
      {#each spaces as space}
        <option value={space}>{space}</option>
      {/each}
    </select>
    <select bind:value={selectedLetter}>
      {#each selectedColorSpace.split("") as letter}
        <option value={letter}>{letter}</option>
      {/each}
    </select>
    <button
      class={buttonStyle}
      on:click={() =>
        colorStore.sortByChannel(
          selectedColorSpace,
          selectedColorSpace.indexOf(selectedLetter)
        )}
    >
      Sort by {selectedLetter}
    </button>
  </span>

  <span slot="target" let:toggle>
    <button class={buttonStyle} on:click={toggle}>Sort</button>
  </span>
</Tooltip>
