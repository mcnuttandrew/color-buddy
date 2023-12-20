<script lang="ts">
  import { colorFromChannels } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;

  type Direction = "horizontal" | "vertical";
  function distributePoints(direction: Direction) {
    let sortedIndexes = focusedColors.sort((a, b) => {
      const pointA = colors[a].toChannels();
      const pointB = colors[b].toChannels();
      if (direction === "horizontal") {
        return pointA[1] - pointB[1];
      } else {
        return pointA[2] - pointB[2];
      }
    });
    type Channels = [number, number, number];
    const minPoint = colors[sortedIndexes[0]].toChannels() as Channels;
    const maxPoint = colors[
      sortedIndexes[sortedIndexes.length - 1]
    ].toChannels() as Channels;

    const numPoints = sortedIndexes.length - 1;
    let newPoints = sortedIndexes.map((colorIdx, arrIdx) => {
      const t = arrIdx / numPoints;
      const newPoint = colors.at(colorIdx)!.toChannels() as Channels;
      if (direction === "horizontal") {
        newPoint[1] = minPoint[1] * (1 - t) + maxPoint[1] * t;
      } else {
        newPoint[2] = minPoint[2] * (1 - t) + maxPoint[2] * t;
      }
      return newPoint as Channels;
    });
    const zip = <T, U>(arr1: T[], arr2: U[]) =>
      arr1.map((k, i) => [k, arr2[i]] as [T, U]);
    const pointsByIndex = Object.fromEntries(zip(sortedIndexes, newPoints));

    const newColors = [...colors].map((color, idx) => {
      const point = pointsByIndex[idx];
      return point ? colorFromChannels(point, "lab") : color;
    });

    colorStore.setCurrentPalColors(newColors);
  }
  const directions: Direction[] = ["horizontal", "vertical"];
</script>

{#if focusedColors.length > 2}
  <Tooltip>
    <div slot="content" class="w-40">
      {#each directions as direction}
        <button
          class={buttonStyle}
          on:click={() => distributePoints(direction)}
        >
          {direction}ly
        </button>
      {/each}
    </div>
    <div slot="target" let:toggle>
      <button class={buttonStyle} on:click={toggle}>Distribute</button>
    </div>
  </Tooltip>
{/if}
