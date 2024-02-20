<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";

  import Background from "../components/Background.svelte";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";
  import MiniPalPreview from "../components/MiniPalPreview.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import Nav from "../components/Nav.svelte";

  import { buttonStyle } from "../lib/styles";

  import SetColorSpace from "../controls/SetColorSpace.svelte";

  export let scatterSize = 450;

  $: currentPalIdx = $colorStore.currentPal;
  $: currentPal = $colorStore.palettes[currentPalIdx];
  $: compareIdx = $configStore.comparePal;
  $: focused = $focusStore.focusedColors;
  $: ComparisonPal =
    typeof compareIdx === "number"
      ? $colorStore.palettes[compareIdx]
      : undefined;

  $: bg = ComparisonPal?.background.toHex() || "white";
  let showDiff = false;

  let colorSpace = ComparisonPal?.colorSpace || "lab";
</script>

<div style={`max-width: ${scatterSize + 50}px`}>
  <div class="flex flex-col">
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
        <div>
          <button class={buttonStyle} on:click={() => (showDiff = !showDiff)}>
            {#if showDiff}Hide{:else}Show{/if} diff
          </button>
        </div>
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
        height={scatterSize}
        width={scatterSize}
        onColorsChange={() => {}}
        onFocusedColorsChange={() => {}}
        startDragging={() => {}}
        stopDragging={() => {}}
        blindColors={(showDiff
          ? currentPal.colors.map((x) => x.toColorSpace(colorSpace))
          : []
        ).slice(
          0,
          Math.min(ComparisonPal.colors.length, currentPal.colors.length)
        )}
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

      <!-- <GetColorsFromString
      allowSort={false}
      colors={ComparisonPal.colors}
      onChange={() => {}}
      {colorSpace}
    /> -->
    </div>
  {/if}
  <Nav tabs={["example"]} selectTab={() => {}} isTabSelected={() => true} />
  {#if compareIdx !== undefined}
    <div class="example-holder">
      <ExampleAlaCart
        paletteIdx={compareIdx}
        exampleIdx={$configStore.compareSelectedExample}
        setExampleIdx={(idx) => configStore.setCompareSelectedExample(idx)}
      />
    </div>
  {/if}
</div>

<style>
  .empty-pal-holder {
    height: 450px;
    width: 450px;
  }
  .example-holder {
    width: 450px;
  }
</style>
