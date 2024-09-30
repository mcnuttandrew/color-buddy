<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";

  import SetSimulation from "../controls/SetSimulation.svelte";
  import Zoom from "../controls/Zoom.svelte";
  import Finger from "virtual:icons/fa6-solid/hand-pointer";

  import { colorPickerConfig } from "../lib/utils";

  import { cvdSim } from "color-buddy-palette";

  export let scatterSize = 450;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: selectedCVDType = $configStore.colorSim;
  $: config = colorPickerConfig[currentPal.colorSpace];
</script>

<div class="flex mb-2 w-full bg-stone-100 py-1 px-4 border-stone-200">
  <SetSimulation />
  {#if !config.isPolar}
    <Zoom />
  {/if}
  <div class="flex flex-col ml-2">
    <div class="text-sm">
      {#if $configStore.scatterplotMode === "putting"}Adding{:else}Add color{/if}
    </div>
    <button
      class={`${buttonStyle} text-sm flex items-center justify-center py-1`}
      on:click={() => configStore.setScatterplotMode("putting")}
    >
      <Finger class="text-xs" />
    </button>
  </div>
</div>
<div class="flex flex-col px-4">
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
    <div class="flex justify-start text-gray-400 text-sm mb-2">
      <input
        class="mr-1"
        on:change={(e) =>
          configStore.setShowGamutMarkers(e.currentTarget.checked)}
        type="checkbox"
        checked={$configStore.showGamutMarkers}
      />
      <span>Mark out-of-gamut colors with ⨂</span>
    </div>
    <div class="flex"></div>
  </div>
</div>
<div class="flex flex-col">
  <ExampleAlaCart
    labelStyle={"bg-stone-100 py-2 px-4 border-t border-stone-200"}
    paletteIdx={$colorStore.currentPal}
    exampleIdx={$configStore.mainColumnSelectedExample}
    setExampleIdx={(idx) => configStore.setMainColumnSelectedExample(idx)}
    allowModification={true}
    bgColor={currentPal.background.toHex()}
    size={scatterSize}
  />
</div>
