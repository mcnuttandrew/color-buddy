<script lang="ts">
  import { colorFromHex, colorFromString } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import ColorScatterPlot from "../components/ColorScatterPlot.svelte";

  $: ComparisonPal = $colorStore.palettes.find(
    (x) => x.name === $configStore.comparePal
  );
  $: {
    if (
      ComparisonPal === undefined &&
      $colorStore.currentPal.name === $configStore.comparePal
    ) {
      ComparisonPal = $colorStore.currentPal;
    }
  }
  let bg = ComparisonPal?.background.toHex() || "white";

  let colorSpace = ComparisonPal?.colorSpace || "lab";
</script>

<div class="flex flex-col" style={`background: ${bg}`}>
  <select value={$configStore.comparePal}>
    {#each [$colorStore.currentPal, ...$colorStore.palettes] as pal}
      <option
        value={pal.name}
        on:click={() => {
          configStore.setComparePal(pal.name);
        }}
      >
        {pal.name}
      </option>
    {/each}
  </select>
  {#if ComparisonPal !== undefined}
    <ColorScatterPlot
      scatterPlotMode="looking"
      Pal={{ ...ComparisonPal, background: colorFromHex(bg, colorSpace) }}
      {colorSpace}
      focusedColors={$focusStore.focusedColors}
      height={450}
      width={450}
      onColorsChange={() => {}}
      onFocusedColorsChange={() => {}}
      startDragging={() => {}}
      stopDragging={() => {}}
    />
  {/if}
</div>
<div class="bg-white">
  <label>
    Color Space:
    <select bind:value={colorSpace}>
      {#each ["lab", "oklab", "hsl", "hsv", "jzazbz"] as space}
        <option value={space}>
          {space}
        </option>
      {/each}
    </select>
  </label>
  <label>
    Background:
    <input type="color" bind:value={bg} />
  </label>
</div>
