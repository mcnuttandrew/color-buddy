<script lang="ts">
  import { colorFromHex } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import ColorScatterPlot from "../components/ColorScatterPlot.svelte";
  import Background from "./Background.svelte";
  import { buttonStyle } from "../lib/styles";

  import SetColorSpace from "./contextual-tools/SetColorSpace.svelte";

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
  <div class="flex">
    {#each [$colorStore.currentPal, ...$colorStore.palettes] as pal, idx}
      <button
        class={buttonStyle}
        on:click={() => {
          configStore.setComparePal(pal.name);
        }}
      >
        {#if idx === 0}THE CURRENT PALETTE:
        {/if}
        {pal.name}
      </button>
    {/each}
  </div>
  <!-- <select value={$configStore.comparePal}>
    {#each [$colorStore.currentPal, ...$colorStore.palettes] as pal, idx}
      <option
        value={pal.name}
        on:click={() => {
          configStore.setComparePal(pal.name);
        }}
      >
        {#if idx === 0}THE CURRENT PALETTE:
        {/if}
        {pal.name}
      </option>
    {/each}
  </select> -->
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
<div class="flex">
  <Background
    onChange={(background) => {
      bg = background.toHex();
    }}
    bg={colorFromHex(bg, colorSpace)}
    {colorSpace}
  />
  <SetColorSpace
    {colorSpace}
    onChange={(space) => {
      colorSpace = space;
    }}
  />
</div>
