<script lang="ts">
  import colorStore from "./stores/color-store";
  import focusStore from "./stores/focus-store";
  import configStore from "./stores/config-store";
  import { buttonStyle } from "./lib/styles";

  import Nav from "./components/Nav.svelte";

  import LeftPanel from "./content-modules/LeftPanel.svelte";
  import Examples from "./content-modules/Examples.svelte";
  import Eval from "./content-modules/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  import ComparePal from "./content-modules/ComparePal.svelte";
  import ColorScatterPlot from "./components/ColorScatterPlot.svelte";
  import SetSimulation from "./content-modules/context-free-tools/SetSimulation.svelte";
  import Zoom from "./content-modules/context-free-tools/Zoom.svelte";
  import Background from "./content-modules/Background.svelte";
  import SetColorSpace from "./content-modules/contextual-tools/SetColorSpace.svelte";
  import PalPreview from "./components/PalPreview.svelte";
  import Sort from "./content-modules/context-free-tools/Sort.svelte";
  import SuggestName from "./content-modules/context-free-tools/SuggestName.svelte";
  import GetColorsFromString from "./content-modules/context-free-tools/GetColorsFromString.svelte";
  import NewPal from "./content-modules/context-free-tools/NewPal.svelte";

  import ContentEditable from "./components/ContentEditable.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  const tabs = ["examples", "compare", "eval"];
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

<main class="flex h-full">
  <LeftPanel />
  <div class="h-full flex flex-col grow main-content">
    <div class="flex w-full grow overflow-auto">
      <div class="flex flex-col">
        <div class="w-full flex bg-stone-800 px-2 py-3 text-white">
          <div class="flex">
            <NewPal />
            <button
              id="save"
              class={`${buttonStyle} `}
              on:click={() => {
                const newPal = {
                  ...currentPal,
                  name: `${currentPal.name} copy`,
                  colors: [...currentPal.colors],
                };
                colorStore.createNewPal(newPal);
              }}
            >
              Save
            </button>
          </div>
          <SetSimulation />
          <Zoom />
        </div>
        <div class="flex flex-col h-full px-4">
          <!-- naming stuff -->
          <div class="flex justify-between">
            <div class="flex text-xl">
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
          <ColorScatterPlot
            scatterPlotMode="moving"
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
            <Background
              onChange={(bg) => colorStore.setBackground(bg)}
              bg={currentPal.background}
              colorSpace={currentPal.colorSpace}
            />
            <SetColorSpace
              colorSpace={currentPal.colorSpace}
              onChange={(space) => colorStore.setColorSpace(space)}
            />
            <Sort />
          </div>
          <div class="flex flex-col pl-2">
            <!-- overview / preview -->
            <PalPreview
              highlightSelected={true}
              pal={currentPal}
              allowModification={true}
            />
            <GetColorsFromString />
            <div class="max-w-lg">
              This is a <select
                value={palType}
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
      </div>
      <div class="grow">
        <Nav
          className="bg-stone-800 text-white h-12 items-center "
          {tabs}
          isTabSelected={(x) => $configStore.route === x}
          selectTab={(x) => {
            // @ts-ignore
            configStore.setRoute(x);
          }}
        />

        {#if $configStore.route === "examples"}
          <Examples />
        {:else if $configStore.route === "compare"}
          <ComparePal />
        {:else}
          <Eval />
        {/if}
      </div>
    </div>
    <!-- bottom row -->
  </div>
</main>

<KeyboardHooks />

<style>
  .main-content {
    min-width: 0;
  }
  #save {
    position: relative;
    top: 2px;
  }
</style>
