<script lang="ts">
  import type { LintResult } from "color-buddy-palette-lint";

  import IgnoreIcon from "virtual:icons/fa6-solid/eye-slash";
  import ShowIcon from "virtual:icons/fa6-solid/eye";

  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";

  import { lint } from "../lib/api-calls";
  import { buttonStyle } from "../lib/styles";
  import LintDisplay from "./LintDisplay.svelte";
  import LintCustomizationModal from "./LintCustomizationTab.svelte";
  import GlobalLintConfig from "./GlobalLintConfigModal.svelte";
  import { lintGroupNames, typeToImg } from "../constants";
  import Tooltip from "../components/Tooltip.svelte";
  import QuestionIcon from "virtual:icons/fa6-solid/circle-question";

  import { loadLints } from "../lib/api-calls";

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
    {} as Record<string, LintResult[]>
  );

  function setGroupTo(checks: LintResult[], ignore: boolean) {
    const newEvalConfig = { ...evalConfig };
    checks.forEach((check) => {
      newEvalConfig[check.lintProgram.name] = { ignore };
    });
    colorStore.setCurrentPalEvalConfig(newEvalConfig);
  }
  $: displayMode = $configStore.evalDisplayMode;

  function refreshLints() {
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

  $: numIgnored = Object.values(evalConfig).filter((x) => x.ignore).length;
  $: groupNames = [
    "usability",
    "contrast-accessibility",
    "color-accessibility",
    "design",
    "custom",
  ].filter((x) => (lintGroups[x] || []).length);
</script>

{#if displayMode === "check-customization"}
  <LintCustomizationModal onClose={() => refreshLints()} />
{/if}
<div class=" w-full flex py-1 px-2 items-end bg-stone-100">
  <div class="flex">
    <GlobalLintConfig />
    <div class="ml-1">
      <button
        class={buttonStyle
          .split(" ")
          .filter((x) => !x.startsWith("py"))
          .join(" ")}
        on:click={() => {
          configStore.setEvalDisplayMode("check-customization");
          lintStore.setFocusedLint(false);
        }}
      >
        Customize tests
      </button>
    </div>
  </div>
  {#if numIgnored > 0}
    <button
      class={buttonStyle
        .split(" ")
        .filter((x) => !x.startsWith("py"))
        .join(" ")}
      on:click={() => {
        const newEvalConfig = { ...evalConfig };
        Object.keys(newEvalConfig).forEach((key) => {
          newEvalConfig[key] = { ignore: false };
        });
        colorStore.setCurrentPalEvalConfig(newEvalConfig);
      }}
    >
      Unhide all
    </button>
  {/if}
  <Tooltip>
    <div class="text-sm max-w-md" slot="content">
      This collection of checks validates whether or not your palette matches a
      number of commonly held beliefs about best practices. They wont fit every
      situation! So feel free to turn some off.
    </div>
    <button slot="target" let:toggle on:click={toggle} class="mx-2">
      <QuestionIcon />
    </button>
  </Tooltip>
</div>
<div class="flex h-full">
  <div class="flex flex-col ml-2">
    <div class="overflow-auto h-full mb-28 px-2">
      <!-- lint group -->
      <div class="flex flex-wrap">
        {#each groupNames as lintGroup}
          <div class="border border-stone-200 bg-white max-w-md w-full m-2">
            <div
              class="flex justify-between items-center mb-2 bg-stone-100 pl-2 pr-1 py-1"
            >
              <!-- logo -->
              <div class="flex">
                <div class="h-8 w-8 flex items-center justify-center">
                  <img
                    src={typeToImg[lintGroup]}
                    class="h-6 w-6"
                    alt="Logo for {lintGroup}"
                    title="Logo for {lintGroup} tests"
                  />
                </div>
                <div class="text-xl">{lintGroupNames[lintGroup]}</div>
              </div>
              <!-- show hide stuff -->
              <div>
                {#if (lintGroups[lintGroup] || []).every((x) => !evalConfig[x.lintProgram.name]?.ignore)}
                  <button
                    class={`${buttonStyle} `}
                    on:click={() =>
                      setGroupTo(
                        lintGroups[lintGroup].filter(
                          (x) => x.kind !== "invalid"
                        ) || [],
                        true
                      )}
                  >
                    <IgnoreIcon class="h-4 w-4" />
                  </button>
                {/if}
                {#if (lintGroups[lintGroup] || []).some((x) => evalConfig[x.lintProgram.name]?.ignore)}
                  <button
                    class={`${buttonStyle} `}
                    on:click={() =>
                      setGroupTo(lintGroups[lintGroup] || [], false)}
                  >
                    <ShowIcon class="h-4 w-4" />
                  </button>
                {/if}
              </div>
            </div>
            <div class="px-4">
              <!-- lints in the lint group -->
              {#if !lintGroups[lintGroup].every((x) => x.kind === "ignored" || x.kind === "invalid")}
                <div class="">
                  {#each (lintGroups[lintGroup] || []).sort((a, b) => {
                    return a.kind === "ignored" ? 1 : -1;
                  }) as lintResult}
                    <LintDisplay {lintResult} />
                  {/each}
                </div>
              {:else}
                <div class="text-sm italic">
                  All checks in this group are ignored
                </div>
              {/if}
              {#if (lintGroups[lintGroup] || []).length === 0 && $lintStore.loadState === "loading"}
                <div class="text-sm animate-pulse italic font-bold">
                  Loading
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
