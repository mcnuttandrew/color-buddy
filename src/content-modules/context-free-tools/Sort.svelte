<script lang="ts">
  import colorStore from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
  const spaces = ["lab", "lch", "rgb", "hsl", "hsv"];
  let selectedColorSpace: (typeof spaces)[number] = "lab";
  let selectedLetter = "a";
</script>

<Tooltip>
  <span slot="content" let:onClick>
    <button class="underline" on:click={() => colorStore.randomizeOrder()}>
      Randomize order
    </button>
    <button class="underline" on:click={() => colorStore.sortByHue()}>
      Sort by hue
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
  </span>

  <span slot="target" let:toggle>
    <button class="underline" on:click={toggle}>Sort</button>
  </span>
</Tooltip>
