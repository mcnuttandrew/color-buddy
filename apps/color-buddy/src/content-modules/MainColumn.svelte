<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import ExampleAlaCart from "../example/ExampleAlaCarte.svelte";
  import ExampleAlaCarteHeader from "../example/ExampleAlaCarteHeader.svelte";
  import SetColorSpace from "../controls/SetColorSpace.svelte";

  import SetSimulation from "../controls/SetSimulation.svelte";
  import Zoom from "../controls/Zoom.svelte";
  import Finger from "virtual:icons/fa6-solid/hand-pointer";

  import Background from "../components/Background.svelte";
  import DesignPit from "../controls/DesignPit.svelte";

  import { colorPickerConfig } from "../lib/utils";

  import { cvdSim } from "color-buddy-palette";

  export let scatterSize = 450;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: selectedCVDType = $configStore.colorSim;
  $: config = colorPickerConfig[currentPal.colorSpace];
</script>

<div class="flex mb-2 w-full bg-stone-100 py-1 px-4 border-stone-200">
  <SetColorSpace
    colorSpace={currentPal.colorSpace}
    onChange={(space) => {
      colorStore.setColorSpace(space);
      configStore.unsetZoom();
    }}
    showDragPicker={true}
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
  <SetSimulation />
</div>
<div class="flex flex-col px-4 pb-2">
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
  <div class="w-full justify-between flex text-sm mb-2">
    <button
      class={`${buttonStyle
        .split(" ")
        .filter((x) => !x.startsWith("py"))
        .join(" ")} text-sm flex items-center justify-center `}
      on:click={() => configStore.setScatterplotMode("putting")}
    >
      <Finger class="text-xs mr-1" />
      {#if $configStore.scatterplotMode === "putting"}Adding{:else}Add color{/if}
    </button>
    <label class="cursor-pointer">
      <input
        class="mr-1"
        on:change={(e) =>
          configStore.setShowGamutMarkers(e.currentTarget.checked)}
        type="checkbox"
        checked={$configStore.showGamutMarkers}
      />
      <span>Show out-of-gamut ⨂</span>
    </label>
    {#if !config.isPolar}
      <Zoom />
    {/if}
  </div>
</div>

<DesignPit />
