<script lang="ts">
  import { Color, colorFromChannels } from "../../lib/Color";
  import ColorIO from "colorjs.io";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";

  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
  let colorSpace = "lab";

  function createInterpolatedPoints(
    pointA: Color,
    pointB: Color,
    numPoints: number
  ) {
    const points: Color[] = [];
    for (let i = 0; i < numPoints + 1; i++) {
      const t = i / (numPoints + 1);
      if (t === 0 || t === 1) continue;
      const [x1, x2, x3] = new ColorIO("lab", pointA.toChannels()).to(
        colorSpace
      ).coords;
      const [y1, y2, y3] = new ColorIO("lab", pointB.toChannels()).to(
        colorSpace
      ).coords;
      const lab = [
        x1 * (1 - t) + y1 * t,
        x2 * (1 - t) + y2 * t,
        x3 * (1 - t) + y3 * t,
      ] as [number, number, number];
      const finalColor = new ColorIO(colorSpace, lab).to("lab").coords;
      points.push(colorFromChannels(finalColor, "lab"));
    }
    return points;
  }

  let numPointsToAdd = 1;
</script>

{#if focusedColors.length === 2}
  <Tooltip>
    <div slot="content" class="w-40">
      <label for="color-space-select">Color Space</label>
      <select id="color-space-select" bind:value={colorSpace}>
        {#each ["lab", "lch", "hsl", "hsv"] as space}
          <option value={space}>{space}</option>
        {/each}
      </select>
      <label>
        Num points to add
        <select bind:value={numPointsToAdd}>
          {#each [1, 2, 3, 4, 5, 6, 7, 8] as numPoints}
            <option value={numPoints}>{numPoints}</option>
          {/each}
        </select>
      </label>
      <button
        class={buttonStyle}
        on:click={() => {
          let newColors = [...colors];
          const [pointA, pointB] = focusedColors.map((idx) => colors[idx]);
          const newPoints = createInterpolatedPoints(
            pointA,
            pointB,
            numPointsToAdd
          );
          console.log(newPoints);
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
