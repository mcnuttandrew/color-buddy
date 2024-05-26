<script lang="ts">
  import colorStore from "./stores/color-store";
  import focusStore from "./stores/focus-store";
  import configStore from "./stores/config-store";
  import lintStore from "./stores/lint-store";

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
  import Manage from "./content-modules/Manage.svelte";
  import MainColumn from "./content-modules/MainColumn.svelte";
  import SetSimulation from "./controls/SetSimulation.svelte";
  import Zoom from "./controls/Zoom.svelte";
  import NewBrowse from "./content-modules/NewBrowse.svelte";
  import TourProvider from "./content-modules/TourProvider.svelte";
  import { buttonStyle } from "./lib/styles";

  const tabs = ["manage", "browse", "examples", "compare", "eval"];

  import { lint } from "./lib/api-calls";
  import { debounce } from "vega";

  $: route = $configStore.route;
  $: evalRoute = $configStore.evalDisplayMode;
  const bindStr = "!!";
  // it appears that there is a bug in the vega debounce implementation, that causes the second argument to not fire
  let updateSearchDebounced = debounce(10, (x: [any, string]) => {
    const [pal, ignoreString] = x;
    // keep the noise down on the console
    if ((route !== "eval" || evalRoute !== "lint-customization") && pal) {
      lintStore.setLoadState("loading");

      const outPal = {
        ...pal,
        evalConfig: {
          ...pal.evalConfig,
          globallyIgnoredLints: ignoreString.split(bindStr),
        },
      };
      lint(outPal, true).then((res): void => {
        lintStore.postCurrentChecks(res);
      });
    }
  });
  // this weird foot work is to circumvent the svelte reactivity which is weird aggressive in this one specific case
  $: globalString = $lintStore.globallyIgnoredLints.join(bindStr);
  $: globalString, updateSearchDebounced([currentPal, globalString]);

  let innerWidth = window.innerWidth;
  $: scatterSize = Math.max(Math.min(innerWidth * 0.3, 450), 350);
</script>

<main class="flex h-full">
  <LeftPanel />
  <div class="h-full flex flex-col grow main-content">
    <div class="flex w-full grow overflow-auto">
      <div class="flex flex-col">
        <div class="w-full flex bg-stone-800 px-2 py-3 text-white">
          <SetSimulation />
          <Zoom />
          <div>
            <button
              class={buttonStyle}
              on:click={() => configStore.setTour(true)}
            >
              Tour
            </button>
          </div>
        </div>
        {#if palPresent}
          <MainColumn {scatterSize} />
        {:else}
          <div class="flex-grow flex justify-center items-center">
            <div class="text-2xl max-w-md text-center">
              No palettes present, click "New" in the upper left to create a new
              one
            </div>
          </div>
        {/if}
      </div>

      <div class="grow" id="right-col">
        <div class="bg-stone-800">
          <div class="flex">
            <Nav
              className="bg-stone-800 text-white h-12 items-center"
              {tabs}
              isTabSelected={(x) => $configStore.route === x}
              selectTab={(x) => {
                // @ts-ignore
                configStore.setRoute(x);
              }}
            />
          </div>
        </div>
        {#if palPresent}
          {#if $configStore.route === "examples"}
            <Examples />
          {:else if $configStore.route === "compare"}
            <ComparePal {scatterSize} />
          {:else if $configStore.route === "eval"}
            <Eval />
          {:else if $configStore.route === "manage"}
            <Manage />
          {:else if $configStore.route === "browse"}
            <NewBrowse />
          {/if}
        {/if}
      </div>
    </div>
  </div>
</main>

<KeyboardHooks />
<svelte:window bind:innerWidth />
{#if $configStore.tour}
  <TourProvider />
{/if}

<style>
  .main-content {
    min-width: 0;
  }
  .top-bar {
    min-height: 50px !important;
  }
</style>
