<script lang="ts">
  import { colorDirectory } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { avgColors } from "../../lib/utils";

  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;

  function createAvg(colorSpace: any) {
    return avgColors(
      focusedColors.map((idx) => colors[idx]),
      colorSpace
    );
  }
</script>

{#if focusedColors.length > 1}
  <Tooltip>
    <div slot="content">
      Create average in
      {#each Object.keys(colorDirectory) as colorSpace}
        <button
          class="underline mr-2"
          on:click={() =>
            colorStore.addColorToCurrentPal(createAvg(colorSpace))}
        >
          {colorSpace} space
        </button>
      {/each}
    </div>
    <span slot="target" let:toggle>
      <button class="underline mr-2" on:click={toggle}>
        Create average point
      </button>
    </span>
  </Tooltip>
{/if}
