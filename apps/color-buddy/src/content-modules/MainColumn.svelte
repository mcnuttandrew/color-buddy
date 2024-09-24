<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import AdjustColor from "../controls/AdjustColor.svelte";
  import AlignSelection from "../controls/AlignSelection.svelte";
  import DistributePoints from "../controls/DistributePoints.svelte";
  import InterpolatePoints from "../controls/InterpolatePoints.svelte";
  import Rotate from "../controls/Rotate.svelte";

  import { buttonStyle } from "../lib/styles";
  import Background from "../components/Background.svelte";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";
  import PalTypeConfig from "../controls/PalTypeConfig.svelte";
  import SetSimulation from "../controls/SetSimulation.svelte";
  import PalTags from "../controls/PalTags.svelte";
  import Zoom from "../controls/Zoom.svelte";
  import Finger from "virtual:icons/fa6-solid/hand-pointer";

  import SetColorSpace from "../controls/SetColorSpace.svelte";
  import { cvdSim } from "color-buddy-palette";

  export let scatterSize = 450;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: selectedCVDType = $configStore.colorSim;
</script>

<div class="flex flex-col h-full px-4 mt-10">
  <div
    class="flex text-sm flex-wrap"
    style={`max-width: ${scatterSize + 110}px`}
  >
    <PalTypeConfig />
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
  <div class="flex mb-2">
    <PalTags />
    <SetSimulation />
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
  <div class="w-full justify-between flex">
    <div class="flex justify-start text-gray-400 text-sm">
      <input
        class="mr-1"
        on:change={(e) =>
          configStore.setShowGamutMarkers(e.currentTarget.checked)}
        type="checkbox"
        checked={$configStore.showGamutMarkers}
      />
      <span>Mark out-of-gamut colors with ⨂</span>
    </div>
    <div class="flex">
      <Zoom />
      <button
        class={`${buttonStyle} text-sm flex items-center`}
        on:click={() => configStore.setScatterplotMode("putting")}
      >
        <Finger class="text-xs mr-2" />
        {#if $configStore.scatterplotMode === "putting"}Adding{:else}Add color{/if}
      </button>
    </div>
  </div>

  <div class="flex flex-col pl-2" style={`max-width: ${scatterSize + 110}px;`}>
    <div class="flex flex-col">
      <div class="text-sm">Controls</div>
      <div class="flex flex-wrap" style={`max-width: ${scatterSize + 110}px`}>
        <AdjustColor />
        <DistributePoints />
        <AlignSelection />
        <!-- use this to try to quash the rotation/selection bug -->
        {#if $focusStore.focusedColors.length > 1}
          <Rotate />
        {/if}
        <InterpolatePoints />
        {#if $focusStore.focusedColors.length === 0}
          <!-- blank -->
          <div class="{buttonStyle} opacity-0">empty</div>
        {/if}
      </div>
    </div>

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
