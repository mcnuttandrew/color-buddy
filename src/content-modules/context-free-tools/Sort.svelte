<script lang="ts">
  import colorStore from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  const spaces = ["lab", "lch", "hsl", "hsv"];
  let selectedColorSpace: (typeof spaces)[number] = "lab";
  let selectedLetter = "a";
</script>

<Tooltip>
  <span slot="content" let:onClick>
    <button class={buttonStyle} on:click={() => colorStore.randomizeOrder()}>
      Randomize order
    </button>
    <button class={buttonStyle} on:click={() => colorStore.reverseSort()}>
      Reverse order
    </button>
    <div>
      <button
        class={buttonStyle}
        on:click={() =>
          colorStore.sortByChannel(
            selectedColorSpace,
            selectedColorSpace.indexOf(selectedLetter)
          )}
      >
        Sort by <select
          bind:value={selectedLetter}
          on:click={(e) => e.stopPropagation()}
          class="text-black"
        >
          {#each selectedColorSpace.split("") as letter}
            <option value={letter}>{letter}</option>
          {/each}
        </select>
        in
        <select
          bind:value={selectedColorSpace}
          on:click={(e) => e.stopPropagation()}
          class="text-black"
        >
          {#each spaces as space}
            <option value={space}>{space}</option>
          {/each}
        </select>
      </button>
    </div>
  </span>

  <span slot="target" let:toggle>
    <button class={buttonStyle} on:click={toggle}>Sort</button>
  </span>
</Tooltip>
