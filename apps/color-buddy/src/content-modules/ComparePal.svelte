<script lang="ts">
  import { Color } from "color-buddy-palette";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import examplePalStore from "../stores/example-palette-store";

  import ChevDown from "virtual:icons/fa6-solid/angle-down";

  import Background from "../components/Background.svelte";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";
  import MiniPalPreview from "../components/MiniPalPreview.svelte";
  import PalPreview from "../components/PalPreview.svelte";
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
    ? familiarPals
    : $colorStore.palettes.filter((x) => x.folder === selectedFolder.name);
</script>

<div class="w-full border-l-8 border-stone-200 h-full">
  <!-- main -->
  <div class="px-6">
    <div class="flex flex-wrap w-full">
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
          <div class="flex flex-col w-80" slot="content">
            <div class="text-sm">Premade:</div>
            <div class="flex">
              {#each ["sequential", "categorical", "diverging"] as folder}
                <button
                  class={buttonStyle}
                  on:click={() => {
                    configStore.setSelectedFolder({
                      isPreMade: true,
                      name: folder,
                    });
                  }}
                  class:underline={selectedFolder?.isPreMade &&
                    selectedFolder?.name === folder}
                >
                  {folder}/
                </button>
              {/each}
            </div>
            <div class="text-sm">Your folders:</div>
            <div class="flex flex-wrap">
              {#each folders as folder}
                <button
                  class={buttonStyle}
                  on:click={() =>
                    configStore.setSelectedFolder({
                      isPreMade: false,
                      name: folder,
                    })}
                  class:underline={selectedFolder?.isPreMade === false &&
                    selectedFolder?.name === folder}
                >
                  {folder}/
                </button>
              {/each}
            </div>

            <div class="flex flex-wrap mt-4">
              {#each selectedPals as pal, idx (idx)}
                <MiniPalPreview
                  {pal}
                  className={compareIdx === idx ? "border-2 border-black" : ""}
                  onClick={() =>
                    configStore.setComparePal(
                      selectedFolder.isPreMade ? pal : idx
                    )}
                />
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
        <div>
          <div class="flex flex-col">
            <div class="text-sm">Diff</div>
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
          </div>
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
        </div>
      {/if}
    </div>
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
