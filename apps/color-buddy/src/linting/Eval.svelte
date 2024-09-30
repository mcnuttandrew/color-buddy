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
</script>

{#if displayMode === "check-customization"}
  <LintCustomizationModal onClose={() => refreshLints()} />
{/if}
<div class=" w-full flex py-1 px-2 items-end">
  <Tooltip>
    <div class="text-sm max-w-md" slot="content">
      This collection of checks validates whether or not your palette matches a
      number of commonly held beliefs about best practices. They wont fit every
      situation! So feel free to turn some off.
    </div>
    <button slot="target" let:toggle on:click={toggle} class="mx-6">
      <QuestionIcon />
    </button>
  </Tooltip>
  <div class="flex flex-col">
    <div class="text-sm">Check Config</div>
    <div class="flex">
      <div class="">
        <GlobalLintConfig />
      </div>
      <div class="ml-4">
        <button
          class={buttonStyle}
          on:click={() => {
            configStore.setEvalDisplayMode("check-customization");
            lintStore.setFocusedLint(false);
          }}
        >
          Customize a check
        </button>
      </div>
    </div>
  </div>
  {#if numIgnored > 0}
    <div>
      <div class="text-xs">
        <span class="text-red-500">{numIgnored}</span>
        checks ignored
      </div>
      <button
        class={buttonStyle}
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
    </div>
  {/if}
</div>
<div class="flex h-full">
  <div class="flex flex-col ml-2">
    <div class="overflow-auto h-full mb-28 px-2">
      <!-- lint group -->
      <div class="flex flex-wrap">
        {#each Object.keys(lintGroupNames).filter((x) => (lintGroups[x] || []).length) as lintGroup}
          <div
            class="border border-stone-200 bg-white px-4 py-2 max-w-md w-full m-2"
          >
            <div class="flex justify-between items-center mb-2">
              <!-- logo -->
              <div class="flex">
                <div class="h-8 w-8 flex items-center justify-center">
                  <img
                    src={typeToImg[lintGroup]}
                    class="h-6 w-6"
                    alt="Logo for {lintGroup}"
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
              <div class="text-sm animate-pulse italic font-bold">Loading</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
