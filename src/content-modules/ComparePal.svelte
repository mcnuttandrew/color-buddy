<script lang="ts">
  import { colorFromHex } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import ColorScatterPlot from "../components/ColorScatterPlot.svelte";
  import Background from "./Background.svelte";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";

  import SetColorSpace from "./contextual-tools/SetColorSpace.svelte";

  $: compareName = $configStore.comparePal;
  $: ComparisonPal = $colorStore.palettes.find((x) => x.name === compareName);
  $: {
    if (!ComparisonPal && $colorStore.currentPal.name === compareName) {
      ComparisonPal = $colorStore.currentPal;
    }
  }
  let bg = ComparisonPal?.background.toHex() || "white";

  let colorSpace = ComparisonPal?.colorSpace || "lab";
</script>

<div class="flex flex-col" style={`background: ${bg}`}>
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
  {:else}
    <div class="empty-pal-holder flex justify-center items-center">
      Select a palette to compare to. You can do this by clicking the button
      below
    </div>
  {/if}
</div>
<div class="flex">
  <Tooltip>
    <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
      Select comparison. Currently: {compareName || "none"}
    </button>
    <div class="flex flex-wrap w-80" slot="content">
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
  </Tooltip>
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

<style>
  .empty-pal-holder {
    height: 450px;
    width: 450px;
  }
</style>
