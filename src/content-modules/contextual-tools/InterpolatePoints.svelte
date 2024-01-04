<script lang="ts">
  import { Color, colorFromChannels, toColorSpace } from "../../lib/Color";
  import ColorIO from "colorjs.io";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  import PalPreview from "../../components/PalPreview.svelte";
  const interpolationSchemes = ["linear", "quadratic"];

  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
  let colorSpace = "lab";
  let interpolationScheme = "linear";
  let numPoints = 1;
  $: pointA = colors[focusedColors[0]];
  $: pointB = colors[focusedColors[1]];
  $: tempPal = numPoints &&
    colorSpace &&
    interpolationScheme &&
    pointA &&
    pointB && {
      name: $colorStore.currentPal.name,
      background: $colorStore.currentPal.background,
      colors: [pointA, ...createInterpolatedPoints(), pointB],
    };
  function createInterpolatedPoints() {
    const points: Color[] = [];
    for (let i = 0; i < numPoints + 1; i++) {
      let t = i / (numPoints + 1);
      if (interpolationScheme === "quadratic") {
        t = t * t;
      }

      if (t === 0 || t === 1) continue;
      const adjustedSpace = colorSpace === "rgb" ? "srgb" : colorSpace;
      const space = pointA.spaceName === "rgb" ? "srgb" : pointA.spaceName;
      const [x1, x2, x3] = new ColorIO(space, pointA.toChannels()).to(
        adjustedSpace
      ).coords;
      const bSpace = pointB.spaceName === "rgb" ? "srgb" : pointB.spaceName;
      const [y1, y2, y3] = new ColorIO(bSpace, pointB.toChannels()).to(
        adjustedSpace
      ).coords;
      const lab = [
        x1 * (1 - t) + y1 * t,
        x2 * (1 - t) + y2 * t,
        x3 * (1 - t) + y3 * t,
      ] as [number, number, number];
      const finalColor = new ColorIO(adjustedSpace, lab).to(space).coords;
      points.push(colorFromChannels(finalColor, space));
    }
    return points;
  }
</script>

{#if focusedColors.length === 2}
  <Tooltip>
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
      <div class="flex justify-between">
        <label for="interpolate-scheme">Scheme</label>
        <select id="interpolate-scheme" bind:value={interpolationScheme}>
          {#each interpolationSchemes as scheme}
            <option value={scheme}>{scheme}</option>
          {/each}
        </select>
      </div>

      <div class="flex justify-between items-center w-full transition-all">
        <button
          class={buttonStyle}
          on:click={() => {
            focusStore.setColors([focusedColors[1], focusedColors[0]]);
          }}
        >
          flip points
        </button>
      </div>
      <PalPreview pal={tempPal} />
      <button
        class="{buttonStyle} mt-5"
        on:click={() => {
          let newColors = [...colors];
          const newPoints = createInterpolatedPoints();
          newColors = [...newColors, ...newPoints];
          colorStore.setCurrentPalColors(newColors);
        }}
      >
        Add points
      </button>
    </div>
    <span slot="target" let:toggle>
      <button class={buttonStyle} on:click={toggle}>Interpolate</button>
    </span>
  </Tooltip>
{/if}
