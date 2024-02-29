<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";

  import { lint } from "../lib/api-calls";
  import { buttonStyle } from "../lib/styles";
  import LintDisplay from "./LintDisplay.svelte";
  import LintCustomizationModal from "./LintCustomizationModal.svelte";
  import Nav from "../components/Nav.svelte";
  import NewLintSuggestion from "./NewLintSuggestion.svelte";
  import { titleCase } from "../lib/utils";
  import EvalColorColumn from "./EvalColorColumn.svelte";
  import GlobalLintConfig from "./GlobalLintConfig.svelte";

  import type { LintResult } from "../lib/ColorLint";

  import { loadLints } from "../lib/api-calls";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: checks = $lintStore.currentChecks;

  $: checkGroups = checks.reduce(
    (acc, check) => {
      if (!acc[check.group]) {
        acc[check.group] = [];
      }
      acc[check.group].push(check);
      return acc;
    },
    { accessibility: [], design: [], usability: [] } as Record<
      string,
      LintResult[]
    >
  );

  function setGroupTo(checks: LintResult[], ignore: boolean) {
    const newEvalConfig = { ...evalConfig };
    checks.forEach((check) => {
      newEvalConfig[check.name] = { ignore };
    });
    colorStore.setCurrentPalEvalConfig(newEvalConfig);
  }
  $: displayMode = $configStore.evalDisplayMode;
  $: isCompact = displayMode === "compact";

  let innerWidth = window.innerWidth;
  $: showEvalColumn = innerWidth >= 1600;
  $: {
    if (showEvalColumn && $configStore.leftRoute === "colors") {
      configStore.setLeftPanelRoute("controls");
    }
  }
</script>

<div class="bg-stone-300 w-full flex">
  <Nav
    tabs={["regular", "compact", "lint-customization"]}
    isTabSelected={(x) => x === displayMode}
    selectTab={(x) => {
      //@ts-ignore
      configStore.setEvalDisplayMode(x);
    }}
  />
  <GlobalLintConfig />
</div>
<div class="flex h-full bg-stone-100">
  {#if displayMode === "lint-customization"}
    <LintCustomizationModal />
  {:else}
    {#if showEvalColumn}
      <div class="bg-stone-300">
        <EvalColorColumn />
      </div>
    {/if}
    <div class="flex flex-col ml-2">
      <div class="overflow-auto h-full max-w-lg mb-28 px-2">
        <div class="flex items-start justify-start">
          {#if Object.keys(currentPal.evalConfig)}
            <div>
              <button
                class={`${buttonStyle} ml-0 pl-0`}
                on:click={() => colorStore.setCurrentPalEvalConfig({})}
              >
                Restore Defaults
              </button>
            </div>
          {/if}
          <NewLintSuggestion />
        </div>
        <div class="text-sm">
          This collection of checks validates whether or not your palette
          matches a number of commonly held beliefs about best practices. They
          wont fit every situation. So don't feel shamed if you ignore some of
          them. They are just a good starting point for thinking about how to
          improve your palette.
        </div>
        {#each Object.entries(checkGroups) as checkGroup}
          <div class="flex mt-4">
            <div class="font-bold">{titleCase(checkGroup[0])} Checks</div>
            <button
              class={`${buttonStyle} `}
              on:click={() => setGroupTo(checkGroup[1], true)}
            >
              ignore all
            </button>
            {#if checkGroup[1].some((x) => evalConfig[x.name]?.ignore)}
              <button
                class={`${buttonStyle} `}
                on:click={() => setGroupTo(checkGroup[1], false)}
              >
                re-enable all
              </button>
            {/if}
          </div>
          <div class="flex">
            {#if isCompact}
              {#each checkGroup[1] as check}
                {#if check.passes}
                  <LintDisplay {check} justSummary={true} />
                {/if}
              {/each}
            {/if}
          </div>
          {#each checkGroup[1] as check}
            {#if !isCompact || (isCompact && !check.passes)}
              <LintDisplay {check} />
            {/if}
          {/each}
          {#if checkGroup[1].length === 0 && $lintStore.loadState === "loading"}
            <div class="text-sm animate-pulse italic font-bold">Loading</div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<svelte:window bind:innerWidth />
