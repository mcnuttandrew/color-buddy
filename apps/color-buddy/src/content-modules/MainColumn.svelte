<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";
  import Background from "../components/Background.svelte";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";
  import PalTypeConfig from "../controls/PalTypeConfig.svelte";
  import SetSimulation from "../controls/SetSimulation.svelte";

  import SetColorSpace from "../controls/SetColorSpace.svelte";
  import { cvdSim } from "color-buddy-palette";

  export let scatterSize = 450;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: selectedCVDType = $configStore.colorSim;
</script>

<div class="flex flex-col h-full px-4 mt-10">
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
    <PalTypeConfig />
    <SetSimulation />
  </div>
  <div>
    <button
      class={`${buttonStyle} pl-0`}
      on:click={() => configStore.setScatterplotMode("putting")}
    >
      Add color {#if $configStore.scatterplotMode === "putting"}(move mouse on
        chart){/if}
    </button>
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

  <div class="flex flex-col pl-2" style={`max-width: ${scatterSize + 110}px;`}>
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
