<script lang="ts">
  import { Color, colorPickerConfig } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = currentPal.colorSpace;
  $: config = colorPickerConfig[colorSpace];
  $: zName = colorPickerConfig[colorSpace].zChannel;

  type Direction = "horizontal" | "vertical" | "in z space";
  function distributePoints(direction: Direction) {
    let sortedIndexes = focusedColors.sort((a, b) => {
      const modeToIdx = { horizontal: 1, vertical: 2, "in z space": 0 };
      const idx = modeToIdx[direction];
      const pointA = colors[a].toChannels()[idx];
      const pointB = colors[b].toChannels()[idx];
      return pointA - pointB;
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
      const xIdx = config.xChannelIndex;
      const yIdx = config.yChannelIndex;
      const zIdx = config.zChannelIndex;
      if (direction === "horizontal") {
        newPoint[xIdx] = minPoint[xIdx] * (1 - t) + maxPoint[xIdx] * t;
      } else if (direction === "vertical") {
        newPoint[yIdx] = minPoint[yIdx] * (1 - t) + maxPoint[yIdx] * t;
      } else {
        newPoint[zIdx] = minPoint[zIdx] * (1 - t) + maxPoint[zIdx] * t;
      }
      return newPoint as Channels;
    });
    const zip = <T, U>(arr1: T[], arr2: U[]) =>
      arr1.map((k, i) => [k, arr2[i]] as [T, U]);
    const pointsByIndex = Object.fromEntries(zip(sortedIndexes, newPoints));

    const newColors = [...colors].map((color, idx) => {
      const point = pointsByIndex[idx];
      return point ? Color.colorFromChannels(point, colorSpace) : color;
    });

    colorStore.setCurrentPalColors(newColors);
  }
  $: directions = [
    "horizontal",
    "vertical",
    `in ${zName} space`,
  ] as Direction[];
</script>

{#if focusedColors.length > 2}
  <div class="w-full border-t-2 border-black my-2"></div>
  <div class="font-bold">Distribute</div>
  <div class="flex flex-wrap">
    {#each directions as direction}
      <button class={buttonStyle} on:click={() => distributePoints(direction)}>
        {direction}
      </button>
    {/each}
  </div>
{/if}
