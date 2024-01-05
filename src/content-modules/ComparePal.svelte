<script lang="ts">
  import colorStore from "../stores/color-store";
  import navStore from "../stores/nav-store";
  import ColorScatterPlot from "../components/ColorScatterPlot.svelte";

  $: ComparisonPal = $colorStore.palettes.find(
    (x) => x.name === $navStore.comparePal
  );
</script>

<div class="flex flex-col">
  <select value={$navStore.comparePal}>
    {#each $colorStore.palettes as pal}
      <option
        value={pal.name}
        on:click={() => {
          navStore.setComparePal(pal.name);
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
    />
  {/if}
</div>
