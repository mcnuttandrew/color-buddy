<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import ColorScatterPlot from "../components/ColorScatterPlot.svelte";

  $: ComparisonPal = $colorStore.palettes.find(
    (x) => x.name === $configStore.comparePal
  );
</script>

<div class="flex flex-col">
  <select value={$configStore.comparePal}>
    {#each $colorStore.palettes as pal}
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
      Pal={ComparisonPal}
      colorSpace={$colorStore.currentPal.colors[0].spaceName}
      focusedColors={[]}
      height={450}
      width={450}
      onColorsChange={() => {}}
      onFocusedColorsChange={() => {}}
      startDragging={() => {}}
      stopDragging={() => {}}
    />
  {/if}
</div>
