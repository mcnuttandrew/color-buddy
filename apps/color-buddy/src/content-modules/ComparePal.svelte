<script lang="ts">
  import { Color } from "color-buddy-palette";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import examplePalStore from "../stores/example-palette-store";
  import Nav from "../components/Nav.svelte";
  import PalPreview from "../components/PalPreview.svelte";

  import ChevDown from "virtual:icons/fa6-solid/angle-down";

  import Background from "../components/Background.svelte";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";
  import MiniPalPreview from "../components/MiniPalPreview.svelte";
  import Tooltip from "../components/Tooltip.svelte";

  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";

  import SetColorSpace from "../controls/SetColorSpace.svelte";

  export let scatterSize = 450;

  $: currentPalIdx = $colorStore.currentPal;
  $: currentPal = $colorStore.palettes[currentPalIdx];
  $: compareIdx = $configStore.comparePal;
  $: focused = $focusStore.focusedColors;
  $: ComparisonPal =
    compareIdx === "tempPal"
      ? $configStore.tempPal
      : typeof compareIdx === "number"
        ? $colorStore.palettes[compareIdx]
        : undefined;

  $: bg =
    $configStore.compareBackground ||
    ComparisonPal?.background.toHex() ||
    "white";

  const diffOptions = ["off", "dots", "dots-and-lines"] as const;
  const diffToLabel = {
    off: "Off",
    dots: "Dots",
    "dots-and-lines": "Dots and Lines",
  };
  $: showDiff = $configStore.compareDiff || "off";

  let colorSpace = ComparisonPal?.colorSpace || "lab";
  $: selectedFolder = $configStore.selectedFolder;
  $: familiarPals = $examplePalStore.palettes
    .map((x) => x.palette)
    .filter((x) => selectedFolder.isPreMade && x.type === selectedFolder.name);
  let folders = Array.from(
    new Set($colorStore.palettes.map((x) => x.folder))
  ).sort((a, b) => a.length - b.length);

  $: selectedPals = selectedFolder.isPreMade
    ? $examplePalStore.palettes.map((x) => x.palette)
    : $colorStore.palettes;
</script>

<div class="w-full h-full bg-stone-100">
  <!-- main -->
  <div class="flex flex-wrap w-full py-2 px-2">
    <div class="flex flex-col mr-2">
      <div class="text-sm">Compare Palette</div>
      <Tooltip>
        <button
          class={`${buttonStyle} `}
          slot="target"
          let:toggle
          on:click={toggle}
        >
          {#if ComparisonPal !== undefined}
            {ComparisonPal.name}
          {:else}
            No Palette Selected
          {/if}
        </button>
        <div
          class="flex flex-col max-w-md max-h-96 overflow-y-auto"
          slot="content"
        >
          <div class="text-sm">Premade:</div>
          <Nav
            className=""
            tabs={["sequential", "categorical", "diverging"]}
            isTabSelected={(x) =>
              selectedFolder?.isPreMade && selectedFolder?.name === x}
            selectTab={(x) => {
              configStore.setSelectedFolder({
                isPreMade: true,
                name: x,
              });
            }}
          />

          <div class="text-sm">Your folders:</div>
          <Nav
            className=""
            tabs={folders}
            isTabSelected={(x) =>
              selectedFolder?.isPreMade === false && selectedFolder?.name === x}
            selectTab={(x) => {
              configStore.setSelectedFolder({
                isPreMade: false,
                name: x,
              });
            }}
            formatter={(x) => (x.length ? `${x}` : "Home")}
          />

          <div class="flex flex-wrap mt-4">
            {#each selectedPals as pal, idx (idx)}
              {#if (selectedFolder.isPreMade && pal.type === selectedFolder.name) || (!selectedFolder.isPreMade && pal.folder === selectedFolder.name)}
                <button
                  class="flex flex-col items-start cursor-pointer border-2 p-1 rounded"
                  class:border-black={selectedFolder.isPreMade
                    ? pal.name === ComparisonPal?.name
                    : compareIdx === idx}
                  class:border-white={selectedFolder.isPreMade
                    ? pal.name !== ComparisonPal?.name
                    : compareIdx !== idx}
                  on:click={() =>
                    configStore.setComparePal(
                      selectedFolder.isPreMade ? pal : idx
                    )}
                >
                  <span class="text-xs">{pal.name}</span>
                  <PalPreview {pal} />
                </button>
              {/if}
            {/each}
          </div>
        </div>
      </Tooltip>
    </div>
    {#if ComparisonPal !== undefined}
      <div class="mr-2">
        <SetColorSpace
          {colorSpace}
          onChange={(space) => {
            colorSpace = space;
          }}
        />
      </div>
      <div class="mr-2">
        <Background
          onChange={(background) => {
            bg = background.toHex();
            configStore.setCompareBackground(background.toHex());
          }}
          onSpaceChange={(space) => {
            // @ts-ignore
            configStore.setCompareBackgroundSpace(space);
          }}
          bg={Color.colorFromHex(bg, colorSpace)}
          colorSpace={$configStore.compareBackgroundSpace}
        />
      </div>
      <div class="flex flex-col">
        <div class="text-sm">Diff</div>
        <div class="flex">
          <Tooltip positionAlongRightEdge={true}>
            <div slot="content" class="flex flex-col">
              {#each diffOptions as diff}
                <button
                  class={simpleTooltipRowStyle}
                  on:click={() => configStore.setCompareDiff(diff)}
                  class:font-bold={showDiff === diff}
                >
                  {diffToLabel[diff]}
                </button>
              {/each}
            </div>
            <button
              slot="target"
              let:toggle
              class={`${buttonStyle} flex items-center`}
              on:click={toggle}
            >
              {diffToLabel[showDiff]}

              <ChevDown class="text-sm ml-2" />
            </button>
          </Tooltip>
          {#if compareIdx === "tempPal" && ComparisonPal}
            <button
              class={buttonStyle}
              on:click={() => {
                configStore.setComparePal(currentPalIdx);
                colorStore.createNewPal(ComparisonPal);
              }}
            >
              Modify this palette
            </button>
          {/if}
          {#if compareIdx !== "tempPal" && ComparisonPal}
            <button
              class={buttonStyle}
              on:click={() => {
                colorStore.startUsingPal(compareIdx);
              }}
            >
              Modify this palette
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <div class="px-6">
    <div>&nbsp;</div>
    {#if ComparisonPal !== undefined}
      <div style={`max-width: ${scatterSize + 110}px`}>
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
          showLines={showDiff === "dots-and-lines"}
          annotationColors={(showDiff !== "off"
            ? currentPal.colors.map((x) => x.toColorSpace(colorSpace))
            : []
          ).slice(
            0,
            Math.min(ComparisonPal.colors.length, currentPal.colors.length)
          )}
        />
      </div>
    {:else}
      <div class="empty-pal-holder flex justify-center items-center">
        Select a palette to compare to. You can do this by clicking the button
        below
      </div>
    {/if}

    {#if compareIdx !== undefined}
      <div
        class="flex justify-center-center flex-col"
        style={`max-width: ${scatterSize + 110}px`}
      >
        <ExampleAlaCart
          paletteIdx={compareIdx}
          exampleIdx={$configStore.compareSelectedExample}
          setExampleIdx={(idx) => configStore.setCompareSelectedExample(idx)}
          allowModification={false}
          bgColor={bg}
          size={scatterSize}
        />
      </div>
    {/if}
  </div>
</div>
