<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import ColorScatterPlot from "../components/ColorScatterPlot.svelte";
  import Background from "./Background.svelte";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import MiniPalPreview from "../components/MiniPalPreview.svelte";

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
    <div class="text-xl">
      <span class="italic">Compare Pal: {compareName}</span>
    </div>
    <ColorScatterPlot
      scatterPlotMode="looking"
      Pal={{ ...ComparisonPal, background: Color.colorFromHex(bg, colorSpace) }}
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
    <div class="flex flex-col w-80" slot="content">
      <div class="flex flex-col">
        Current Palette:
        <MiniPalPreview
          pal={$colorStore.currentPal}
          onClick={() => configStore.setComparePal($colorStore.currentPal.name)}
        />
      </div>
      <div>Other Saved Palettes:</div>
      <div class="flex flex-wrap">
        {#each [$colorStore.currentPal, ...$colorStore.palettes] as pal, idx}
          <MiniPalPreview
            {pal}
            onClick={() => configStore.setComparePal(pal.name)}
          />
        {/each}
      </div>
    </div>
  </Tooltip>
  <Background
    onChange={(background) => {
      bg = background.toHex();
    }}
    bg={Color.colorFromHex(bg, colorSpace)}
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
