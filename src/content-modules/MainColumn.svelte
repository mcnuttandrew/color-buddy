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

  import ModifySelection from "../controls/ModifySelection.svelte";
  import Nav from "../components/Nav.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import SetColorSpace from "../controls/SetColorSpace.svelte";
  import simulate_cvd from "../lib/blindness";

  import ContentEditable from "../components/ContentEditable.svelte";

  export let scatterSize = 450;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: selectedBlindType = $configStore.colorSim;
</script>

<div class="flex flex-col h-full px-4">
  <!-- naming stuff -->
  <div class="flex font-bold">
    <span class="italic">Current Pal:</span>
    <div class="flex">
      <span>✎</span>
      <ContentEditable
        onChange={(x) => colorStore.setCurrentPalName(x)}
        value={currentPal.name}
      />
    </div>
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
    stopDragging={() => colorStore.resumePersistance()}
    blindColors={selectedBlindType === "none"
      ? []
      : currentPal.colors.map((x) => simulate_cvd(selectedBlindType, x))}
  />

  <div class="flex flex-wrap">
    <button
      class={buttonStyle}
      on:click={() => configStore.setScatterplotMode("putting")}
    >
      Add color {#if $configStore.scatterplotMode === "putting"}(move mouse on
        chart){/if}
    </button>
    <AdjustOrder />

    <ModifySelection />
  </div>
  <div class="flex flex-col pl-2">
    <!-- overview / preview -->
    <PalPreview
      highlightSelected={true}
      pal={currentPal}
      allowModification={true}
    />
    <Nav
      tabs={["palette-config", "example"]}
      isTabSelected={(x) => x === $configStore.mainColumnRoute}
      selectTab={(x) => {
        //@ts-ignore
        configStore.setMainColumnRoute(x);
      }}
    />
    {#if $configStore.mainColumnRoute === "palette-config"}
      <PalTypeConfig />
    {/if}
    {#if $configStore.mainColumnRoute === "example"}
      <ExampleAlaCart
        paletteIdx={$colorStore.currentPal}
        exampleIdx={$configStore.mainColumnSelectedExample}
        setExampleIdx={(idx) => configStore.setMainColumnSelectedExample(idx)}
        allowModification={true}
        bgColor={currentPal.background.toHex()}
      />
    {/if}
  </div>
</div>
