<script lang="ts">
  import { Color } from "../../lib/Color";
  import type { Palette } from "../../stores/color-store";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  import PalPreview from "../../components/PalPreview.svelte";

  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: colors = $colorStore.currentPal.colors;
  let colorSpace = "lab";
  let numPoints = 1;
  let open = false;
  $: tempPal = (numPoints &&
    colorSpace &&
    focusedColors.length >= 2 &&
    open && {
      ...$colorStore.currentPal,
      colors: createInterpolation(),
    }) as Palette;
  function createInterpolatedPoints(pointA: Color, pointB: Color) {
    const points: Color[] = [];
    for (let i = 0; i < numPoints + 1; i++) {
      let t = i / (numPoints + 1);

      if (t === 0 || t === 1) continue;
      const spaceOverWrite = { rgb: "srgb" } as any;
      const adjustedSpace = spaceOverWrite[colorSpace] || colorSpace;
      const space = spaceOverWrite[pointA.spaceName] || pointA.spaceName;
      const [x1, x2, x3] = pointA.toColorIO().to(adjustedSpace).coords;
      const [y1, y2, y3] = pointB.toColorIO().to(adjustedSpace).coords;
      const lab = [
        x1 * (1 - t) + y1 * t,
        x2 * (1 - t) + y2 * t,
        x3 * (1 - t) + y3 * t,
      ] as [number, number, number];
      points.push(Color.colorFromChannels(lab, "lab").toColorSpace(space));
    }
    return points;
  }
  function createInterpolation(): Color[] {
    const newColors = [];
    for (let idx = 0; idx < focusedColors.length - 1; idx++) {
      const pointA = colors[focusedColors[idx]];
      const pointB = colors[focusedColors[idx + 1]];
      const newPoints = createInterpolatedPoints(pointA, pointB);
      newColors.push(pointA, ...newPoints);
    }
    newColors.push(colors[focusedColors[focusedColors.length - 1]]);
    return newColors;
  }
</script>

{#if focusedColors.length >= 2}
  <Tooltip onClose={() => (open = false)}>
    <div slot="content" class="w-60">
      <div class="flex justify-between">
        <label for="color-space-select">Color Space</label>
        <select id="color-space-select" bind:value={colorSpace}>
          {#each ["lab", "lch", "hsl", "hsv", "oklab", "oklch", "rgb"] as space}
            <option value={space}>{space}</option>
          {/each}
        </select>
      </div>
      <div class="flex justify-between">
        <label for="interpolate-count">Num points to add</label>
        <select id="interpolate-count" bind:value={numPoints}>
          {#each [1, 2, 3, 4, 5, 6, 7, 8] as numPoints}
            <option value={numPoints}>{numPoints}</option>
          {/each}
        </select>
      </div>

      <!-- <div class="flex justify-between items-center w-full transition-all">
        <button
          class={buttonStyle}
          on:click={() => {
            focusStore.setColors([focusedColors[1], focusedColors[0]]);
          }}
        >
          flip points
        </button>
      </div> -->
      <PalPreview pal={tempPal} />
      <button
        class="{buttonStyle} mt-5"
        on:click={() => {
          let newColors = [...colors].filter((_, idx) => !focusSet.has(idx));
          const offset = newColors.length;
          const newPoints = createInterpolation();
          newColors = [...newColors, ...newPoints];
          colorStore.setCurrentPalColors(newColors);
          // also focus all of the new points
          focusStore.setColors([...newPoints.map((_, idx) => offset + idx)]);
        }}
      >
        Add points
      </button>
    </div>
    <span slot="target" let:toggle>
      <button
        class={buttonStyle}
        on:click={() => {
          open = !open;
          toggle();
        }}
      >
        Interpolate
      </button>
    </span>
  </Tooltip>
{/if}
