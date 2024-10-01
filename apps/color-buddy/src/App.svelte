<script lang="ts">
  import { onMount } from "svelte";

  import colorStore from "./stores/color-store";
  import focusStore from "./stores/focus-store";
  import configStore from "./stores/config-store";
  import lintStore from "./stores/lint-store";

  import { logEvent } from "./lib/api-calls";

  onMount(() => {
    logEvent("start-up", {}, $configStore.userName);
  });

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
  import NewPal from "./controls/NewPal.svelte";

  import LeftPanel from "./content-modules/LeftPanel.svelte";
  import Examples from "./example/Examples.svelte";
  import Eval from "./linting/Eval.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  import ComparePal from "./content-modules/ComparePal.svelte";
  import Manage from "./content-modules/Manage.svelte";
  import MainColumn from "./content-modules/MainColumn.svelte";
  import TourProvider from "./content-modules/TourProvider.svelte";
  import Config from "./controls/Config.svelte";
  import Title from "./controls/Title.svelte";

  import { lint } from "./lib/api-calls";
  import { debounce } from "vega";

  import { buttonStyle } from "./lib/styles";

  $: route = $configStore.route;
  $: evalRoute = $configStore.evalDisplayMode;
  const bindStr = "!!";
  // it appears that there is a bug in the vega debounce implementation, that causes the second argument to not fire
  let updateSearchDebounced = debounce(10, (x: [any, string]) => {
    const [pal, ignoreString] = x;
    // keep the noise down on the console
    if ((route !== "eval" || evalRoute !== "check-customization") && pal) {
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
  $: globalString = $colorStore.globallyIgnoredLints.join(bindStr);
  $: globalString, updateSearchDebounced([currentPal, globalString]);

  let innerWidth = window.innerWidth;
  let leftPanelWidth = 320;
  $: columnWidth = (innerWidth - leftPanelWidth) / 2;
  const padding = 40;
  const zWidth = 110;
  $: scatterSize = Math.max(Math.min(columnWidth - zWidth - padding, 420), 200);

  const currentPalTabs = ["examples", "compare", "eval"];
</script>

<header class="flex w-full bg-stone-800 justify-between min-h-12">
  <div class="flex" id="top-controls">
    <div class="text-4xl font-bold text-white px-2 py-1 flex">
      <img src="logo.png" alt="logo" class="h-10 mr-2" />
      <div class="">Color Buddy</div>
    </div>
    <div>
      <div class="flex h-12 items-center">
        <NewPal />
        <Manage />
        <div>
          <button
            class={`${buttonStyle} ml-2 mr-1`}
            on:click={() => colorStore.undo()}
          >
            Undo
          </button>
        </div>
        <div>
          <button
            class={`${buttonStyle} mr-2`}
            on:click={() => colorStore.redo()}
          >
            Redo
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="flex justify-between items-center">
    <Config />
  </div>
</header>
<main class="flex h-full overflow-auto">
  <!-- left and main panel -->
  <div class="flex flex-col">
    <!-- name -->
    <Title />
    <!-- main content -->
    <div class="flex">
      <!-- left -->
      <LeftPanel />
      <!-- main -->
      <div
        class="h-full flex flex-col grow main-content border-b border-l border-stone-200"
      >
        <div class="flex w-full grow overflow-y-auto overflow-x-hidden">
          <div class="flex flex-col">
            {#if palPresent}
              <MainColumn {scatterSize} />
            {:else}
              <div
                class="flex-grow flex justify-center items-center"
                style={`width: ${columnWidth}px`}
              >
                <div class="text-2xl max-w-md text-center">
                  No palettes present, click "New" in the upper left to create a
                  new one, or "Browse" to pick from existing ones.
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- right col -->
  <div
    class="flex flex-col w-full border-b border-l border-stone-200 h-full"
    id="right-col"
  >
    <div class="flex bg-stone-200 w-full border-b border-l border-stone-200">
      <Nav
        className=""
        tabs={currentPalTabs}
        isTabSelected={(x) => $configStore.route === x}
        selectTab={(x) => {
          // @ts-ignore
          configStore.setRoute(x);
        }}
        formatter={(x) => {
          if (x === "eval") {
            return "Evaluation";
          } else if (x === "compare") {
            return "Comparison";
          } else {
            return "Examples";
          }
        }}
      >
        <div slot="menu" let:tab>
          {#if tab === "eval"}
            <div
              class="bg-red-700 text-white rounded-full w-4 h-4 text-xs text-center flex items-center justify-center mx-1"
            >
              {$lintStore.currentChecks.filter(
                (x) => x.kind === "success" && !x.passes
              ).length}
            </div>
          {/if}
        </div>
      </Nav>
    </div>
    <div class="bg-stone-100 h-full">
      {#if palPresent && $configStore.route === "examples"}
        <Examples />
      {:else if palPresent && $configStore.route === "compare"}
        <ComparePal {scatterSize} />
      {:else if palPresent && $configStore.route === "eval"}
        <Eval />
      {/if}
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
</style>
