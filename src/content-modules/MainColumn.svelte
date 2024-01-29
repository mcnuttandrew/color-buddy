<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import { buttonStyle } from "../lib/styles";
  import ColorScatterPlot from "../scatterplot/ColorScatterPlot.svelte";
  import Background from "../components/Background.svelte";
  import SetColorSpace from "../controls/SetColorSpace.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import SuggestName from "../controls/SuggestName.svelte";
  import GetColorsFromString from "../controls/GetColorsFromString.svelte";
  import AdjustOrder from "../controls/AdjustOrder.svelte";
  import ModifySelection from "../controls/ModifySelection.svelte";

  import ContentEditable from "../components/ContentEditable.svelte";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];

  const descriptions = {
    sequential:
      "Sequential palettes are used to represent a range of values. They are often used to represent quantitative data, such as temperature or elevation.",
    diverging:
      "Diverging palettes are used to represent a range of values around a central point. They are often used to represent quantitative data, such as temperature or elevation.",
    categorical:
      "Categorical palettes are used to represent a set of discrete values. They are often used to represent qualitative data, such as different types of land cover or different political parties.",
  };
  $: palType = currentPal.type;
</script>

<div class="flex flex-col h-full px-4">
  <!-- naming stuff -->
  <div class="flex justify-between">
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
    <SuggestName />
  </div>
  <div class="flex">
    <SetColorSpace
      colorSpace={currentPal.colorSpace}
      onChange={(space) => colorStore.setColorSpace(space)}
    />
    <Background
      onChange={(bg) => colorStore.setBackground(bg)}
      bg={currentPal.background}
      colorSpace={currentPal.colorSpace}
    />
  </div>
  <ColorScatterPlot
    scatterPlotMode={$configStore.scatterplotMode}
    colorSpace={currentPal.colorSpace}
    Pal={currentPal}
    focusedColors={$focusStore.focusedColors}
    height={450}
    width={450}
    onColorsChange={(x) => colorStore.setCurrentPalColors(x)}
    onFocusedColorsChange={(x) => focusStore.setColors(x)}
    startDragging={() => colorStore.pausePersistance()}
    stopDragging={() => colorStore.resumePersistance()}
  />

  <div class="flex">
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
    <GetColorsFromString
      allowSort={true}
      onChange={(colors) => colorStore.setCurrentPalColors(colors)}
      colorSpace={currentPal.colorSpace}
      colors={currentPal.colors}
    />
    <div class="max-w-lg text-sm italic">
      This is a <select
        value={palType}
        class="font-bold"
        on:change={(e) => {
          // @ts-ignore
          colorStore.setCurrentPalType(e.target.value);
        }}
      >
        {#each ["sequential", "diverging", "categorical"] as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
      palette. {descriptions[palType]}
    </div>
  </div>
</div>
