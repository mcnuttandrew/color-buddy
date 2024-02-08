<script lang="ts">
  import colorStore from "./stores/color-store";
  import focusStore from "./stores/focus-store";
  import configStore from "./stores/config-store";

  // make sure no focused colors are out of bounds
  $: focusedColors = $focusStore.focusedColors;
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: palPresent = !!($colorStore.palettes.length > 0 && currentPal);
  $: {
    if (focusedColors.some((x) => x > currentPal.colors.length - 1)) {
      focusStore.clearColors();
    }
    if ($colorStore.palettes.length > 0 && !currentPal) {
      colorStore.startUsingPal(0);
    }
  }

  import Nav from "./components/Nav.svelte";

  import LeftPanel from "./content-modules/LeftPanel.svelte";
  import Examples from "./example/Examples.svelte";
  import Eval from "./linting/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  import ComparePal from "./content-modules/ComparePal.svelte";
  import MainColumn from "./content-modules/MainColumn.svelte";
  import SetSimulation from "./controls/SetSimulation.svelte";
  import Zoom from "./controls/Zoom.svelte";

  const tabs = ["examples", "compare", "eval"];
</script>

<main class="flex h-full">
  <LeftPanel />
  <div class="h-full flex flex-col grow main-content">
    <div class="flex w-full grow overflow-auto">
      <div class="flex flex-col">
        <div class="w-full flex bg-stone-800 px-2 py-3 text-white">
          <SetSimulation />
          <Zoom />
        </div>
        {#if palPresent}
          <MainColumn />
        {/if}
      </div>
      {#if palPresent}
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
      {/if}
    </div>
    <!-- bottom row -->
  </div>
</main>

<KeyboardHooks />

<style>
  .main-content {
    min-width: 0;
  }
</style>
