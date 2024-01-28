<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import Background from "../components/Background.svelte";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import MiniPalPreview from "../components/MiniPalPreview.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import GetColorsFromString from "../controls/GetColorsFromString.svelte";

  import SetColorSpace from "../controls/SetColorSpace.svelte";

  $: currentPalIdx = $colorStore.currentPal;
  $: compareIdx = $configStore.comparePal;
  $: focused = $focusStore.focusedColors;
  $: ComparisonPal =
    typeof compareIdx === "number"
      ? $colorStore.palettes[compareIdx]
      : undefined;

  $: bg = ComparisonPal?.background.toHex() || "white";

  let colorSpace = ComparisonPal?.colorSpace || "lab";
</script>

<div class="flex flex-col" style={`background: ${bg}`}>
  {#if ComparisonPal !== undefined}
    <div class="font-bold">
      <span class="italic">Compare: {ComparisonPal.name}</span>
    </div>
    <div class="flex">
      <SetColorSpace
        {colorSpace}
        onChange={(space) => {
          colorSpace = space;
        }}
      />
      <Background
        onChange={(background) => {
          bg = background.toHex();
        }}
        bg={Color.colorFromHex(bg, colorSpace)}
        {colorSpace}
      />
    </div>
    <ColorScatterPlot
      scatterPlotMode="looking"
      Pal={{
        ...ComparisonPal,
        background: Color.colorFromHex(bg, colorSpace),
        colorSpace,
      }}
      {colorSpace}
      focusedColors={currentPalIdx === compareIdx ? focused : []}
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
      Change Compared Palette
    </button>
    <div class="flex flex-col w-80" slot="content">
      <div>Saved Palettes:</div>
      <div class="flex flex-wrap">
        {#each $colorStore.palettes as pal, idx (idx)}
          <MiniPalPreview
            {pal}
            className={compareIdx === idx ? "border-2 border-black" : ""}
            onClick={() => configStore.setComparePal(idx)}
          />
        {/each}
      </div>
    </div>
  </Tooltip>
</div>
{#if ComparisonPal !== undefined}
  <div class="flex flex-col pl-2">
    <PalPreview
      highlightSelected={false}
      pal={ComparisonPal}
      allowModification={false}
    />

    <GetColorsFromString
      allowSort={false}
      colors={ComparisonPal.colors}
      onChange={() => {}}
      {colorSpace}
    />
  </div>
{/if}

<style>
  .empty-pal-holder {
    height: 450px;
    width: 450px;
  }
</style>
