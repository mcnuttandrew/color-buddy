<script lang="ts">
  import { onMount } from "svelte";
  import { Color } from "color-buddy-palette";
  import type { Palette } from "color-buddy-palette";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  import PalPreview from "../components/PalPreview.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: colors = currentPal.colors;
  let colorSpace = "lab";
  onMount(() => {
    if (currentPal) {
      colorSpace = currentPal.colorSpace;
    }
  });
  let numPoints = 1;
  $: tempPal = (numPoints &&
    colorSpace &&
    focusedColors.length >= 2 && {
      ...currentPal,
      colors: createInterpolation(),
    }) as Palette;
  function createInterpolatedPoints(pointA: Color, pointB: Color) {
    const points: Color[] = [];
    for (let i = 0; i < numPoints + 1; i++) {
      let t = i / (numPoints + 1);

      if (t === 0 || t === 1) continue;
      const spaceOverWrite = { rgb: "srgb" } as any;
      const space = spaceOverWrite[colorSpace] || colorSpace;
      // const space = spaceOverWrite[pointA.spaceName] || pointA.spaceName;
      const [x1, x2, x3] = pointA.toColorIO().to(space).coords;
      const [y1, y2, y3] = pointB.toColorIO().to(space).coords;
      const coords = [
        x1 * (1 - t) + y1 * t,
        x2 * (1 - t) + y2 * t,
        x3 * (1 - t) + y3 * t,
      ] as [number, number, number];

      const newColor = Color.colorFromChannels(coords, space);
      points.push(newColor.toColorSpace(currentPal.colorSpace));
    }

    return points;
  }
  function createInterpolation(): Color[] {
    const newColors = [];
    const seenHexes = new Set<string>([]);
    const deDuppedFocusedColors = focusedColors
      .map((x) => [x, colors[x].toHex()] as [number, string])
      .filter(([_idx, hexColor]) => {
        if (seenHexes.has(hexColor)) {
          return false;
        }
        seenHexes.add(hexColor);
        return true;
      })
      .map((x) => x[0]);
    for (let idx = 0; idx < deDuppedFocusedColors.length - 1; idx++) {
      const pointA = colors[deDuppedFocusedColors[idx]];
      const pointB = colors[deDuppedFocusedColors[idx + 1]];
      const newPoints = createInterpolatedPoints(pointA, pointB);
      newColors.push(pointA, ...newPoints);
    }
    newColors.push(
      colors[deDuppedFocusedColors[deDuppedFocusedColors.length - 1]]
    );
    return newColors;
  }
  const interpolationSpecs = [
    "lab",
    "lch",
    "hsl",
    "hct",
    "hsv",
    "cam16-jmh",
    //  "oklch",
    "srgb",
  ] as const;
</script>

<!-- 
  <Tooltip>

    <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
      Interpolate
    </button>
  </Tooltip> -->

<div class="flex flex-col">
  <div class="flex">
    <div class="flex flex-col w-full justify-between">
      <label for="color-space-select" class="text-xs">Color Space</label>
      <select
        id="color-space-select"
        bind:value={colorSpace}
        class={`${buttonStyle} h-8`}
      >
        {#each interpolationSpecs as space}
          <option value={space}>{space.toUpperCase()}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="whitespace-nowrap mr-2 text-xs" for="interpolate-count">
        Number of steps
      </label>
      <input
        id="interpolate-count"
        class="leading-6 {buttonStyle} h-8"
        type="number"
        min="1"
        step="1"
        bind:value={numPoints}
      />
    </div>
  </div>

  <div class="text-xs">Preview</div>
  {#if tempPal}
    <div class="border bg-stone-100 mb-2 ml-1">
      <PalPreview pal={tempPal} />
    </div>
  {/if}
  <div class="w-full flex justify-end">
    <button
      class={buttonStyle}
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
      Add these colors
    </button>
  </div>
</div>
