<script lang="ts">
  import type { LintResult } from "color-buddy-palette-lint";

  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";

  import { lint } from "../lib/api-calls";
  import { buttonStyle } from "../lib/styles";
  import LintDisplay from "./LintDisplay.svelte";
  import LintCustomizationModal from "./LintCustomizationTab.svelte";
  import Nav from "../components/Nav.svelte";
  import NewLintSuggestion from "./NewLintSuggestion.svelte";
  import { titleCase } from "../lib/utils";
  import EvalColorColumn from "./EvalColorColumn.svelte";
  import GlobalLintConfig from "./GlobalLintConfig.svelte";

  import { loadLints } from "../lib/api-calls";
  export let maxWidth: number;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: lintResults = $lintStore.currentChecks;

  $: lintGroups = lintResults.reduce(
    (acc, lintResult) => {
      if (
        $colorStore.globallyIgnoredLints.includes(lintResult.lintProgram.id)
      ) {
        return acc;
      }
      const lint = lintResult.lintProgram;
      if (!acc[lint.group]) {
        acc[lint.group] = [];
      }
      // extremely dumb hack to move WCAGs to the top
      if (lint.name.startsWith("WCAG")) {
        acc[lint.group].push(lintResult);
      } else {
        acc[lint.group].push(lintResult);
      }
      return acc;
    },
    { accessibility: [], usability: [], design: [] } as Record<
      string,
      LintResult[]
    >
  );

  function setGroupTo(checks: LintResult[], ignore: boolean) {
    const newEvalConfig = { ...evalConfig };
    checks.forEach((check) => {
      newEvalConfig[check.lintProgram.name] = { ignore };
    });
    colorStore.setCurrentPalEvalConfig(newEvalConfig);
  }
  $: displayMode = $configStore.evalDisplayMode;
  $: isCompact = displayMode === "compact";

  let innerWidth = window.innerWidth;
  $: showEvalColumn = innerWidth >= 1600;
</script>

<div class="bg-stone-300 w-full flex">
  <Nav
    tabs={["regular", "compact", "lint-customization"]}
    isTabSelected={(x) => x === displayMode}
    selectTab={(x) => {
      // TODO: maybe need to update the lints on change?
      if (displayMode === "lint-customization") {
        const outPal = {
          ...currentPal,
          evalConfig: {
            ...currentPal.evalConfig,
            globallyIgnoredLints: $colorStore.globallyIgnoredLints,
          },
        };
        loadLints()
          .then(() => lint(outPal, false))
          .then((res) => {
            lintResults = res;
          });
      }
      if (x === "lint-customization") {
        // unset the current lint
        lintStore.setFocusedLint(false);
      }
      //@ts-ignore
      configStore.setEvalDisplayMode(x);
    }}
  />
</div>
<div class="flex h-full bg-stone-100" style={`width: ${maxWidth}px`}>
  {#if displayMode === "lint-customization"}
    <LintCustomizationModal {maxWidth} />
  {:else}
    {#if showEvalColumn}
      <div class="bg-stone-300">
        <EvalColorColumn />
      </div>
    {/if}
    <div class="flex flex-col ml-2">
      <div
        class="overflow-auto h-full max-w-lg mb-28 px-2"
        style={`max-width: ${maxWidth - 4}px`}
      >
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
          <GlobalLintConfig />
        </div>
        <div class="text-sm">
          This collection of checks (called lints) validates whether or not your
          palette matches a number of commonly held beliefs about best
          practices. They wont fit every situation.
        </div>
        {#each Object.entries(lintGroups) as lintGroup}
          <div class="flex mt-4">
            <div class="font-bold">{titleCase(lintGroup[0])} Checks</div>
            <button
              class={`${buttonStyle} `}
              on:click={() => setGroupTo(lintGroup[1], true)}
            >
              ignore all
            </button>
            {#if lintGroup[1].some((x) => evalConfig[x.lintProgram.name]?.ignore)}
              <button
                class={`${buttonStyle} `}
                on:click={() => setGroupTo(lintGroup[1], false)}
              >
                re-enable all
              </button>
            {/if}
          </div>
          <div class="flex">
            {#if isCompact}
              {#each lintGroup[1] as lintResult}
                {#if lintResult.kind === "success" && !lintResult.passes}
                  <LintDisplay {lintResult} justSummary={true} />
                {/if}
              {/each}
            {/if}
          </div>
          {#each lintGroup[1] as lintResult}
            {#if !isCompact || (isCompact && lintResult.kind === "success" && !lintResult.passes)}
              <LintDisplay {lintResult} />
            {/if}
          {/each}
          {#if lintGroup[1].length === 0 && $lintStore.loadState === "loading"}
            <div class="text-sm animate-pulse italic font-bold">Loading</div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<svelte:window bind:innerWidth />
