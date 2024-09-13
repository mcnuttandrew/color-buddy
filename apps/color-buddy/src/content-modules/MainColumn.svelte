<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";
  import AdjustOrder from "../controls/AdjustOrder.svelte";
  import Background from "../components/Background.svelte";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";
  import PalTypeConfig from "../controls/PalTypeConfig.svelte";
  import Sort from "../controls/Sort.svelte";

  import ModifySelection from "../controls/ModifySelection.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import SetColorSpace from "../controls/SetColorSpace.svelte";
  import { cvdSim } from "color-buddy-palette";

  import ContentEditable from "../components/ContentEditable.svelte";

  export let scatterSize = 450;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: selectedCVDType = $configStore.colorSim;
</script>

<div class="flex flex-col h-full px-4">
  <!-- naming stuff -->
  <div class="flex font-bold justify-between">
    <div class="flex">
      <span class="italic">Current:</span>
      <div class="flex">
        <ContentEditable
          onChange={(x) => colorStore.setCurrentPalName(x)}
          value={currentPal.name}
          useEditButton={true}
        />
      </div>
    </div>
    <PalTypeConfig />
  </div>
  <!-- tags -->
  <div class="flex text-sm italic">
    {#if currentPal.tags.length}
      Tags:
      {#each currentPal.tags as tag}
        <div class="ml-2">{tag}</div>
      {/each}
    {:else}
      <div>&nbsp;</div>
    {/if}
  </div>
  <div class="flex">
    <SetColorSpace
      colorSpace={currentPal.colorSpace}
      onChange={(space) => colorStore.setColorSpace(space)}
    />
    <Background
      onSpaceChange={(space) => {
        // @ts-ignore
        configStore.setChannelPickerSpaceBackground(space);
      }}
      onChange={(bg) =>
        colorStore.setBackground(bg.toColorSpace(currentPal.colorSpace))}
      bg={currentPal.background}
      colorSpace={$configStore.channelPickerSpaceBackground}
    />
  </div>
  <ColorScatterPlot
    scatterPlotMode={$configStore.scatterplotMode}
    colorSpace={currentPal.colorSpace}
    Pal={currentPal}
    focusedColors={$focusStore.focusedColors}
    height={scatterSize}
    width={scatterSize}
    onColorsChange={(x) => colorStore.setCurrentPalColors(x)}
    onFocusedColorsChange={(x) => focusStore.setColors(x)}
    startDragging={() => colorStore.pausePersistance()}
    showLines={true}
    stopDragging={() => colorStore.resumePersistance()}
    annotationColors={selectedCVDType === "none"
      ? []
      : currentPal.colors.map((x) => cvdSim(selectedCVDType, x))}
  />

  <div
    class="flex flex-wrap"
    id="scatterplot-controls"
    style={`max-width: ${scatterSize + 110}px;`}
  >
    <button
      class={`${buttonStyle} pl-0`}
      on:click={() => configStore.setScatterplotMode("putting")}
    >
      Add color {#if $configStore.scatterplotMode === "putting"}(move mouse on
        chart){/if}
    </button>
    <AdjustOrder />

    <ModifySelection />
    <Sort />
  </div>
  <div class="flex flex-col pl-2">
    <!-- overview / preview -->
    <PalPreview
      allowModification={true}
      highlightSelected={true}
      pal={currentPal}
      showTags={true}
    />

    <ExampleAlaCart
      paletteIdx={$colorStore.currentPal}
      exampleIdx={$configStore.mainColumnSelectedExample}
      setExampleIdx={(idx) => configStore.setMainColumnSelectedExample(idx)}
      allowModification={true}
      bgColor={currentPal.background.toHex()}
      size={scatterSize}
    />
  </div>
</div>
