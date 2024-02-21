<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import lintStore from "../stores/lint-store";
  import configStore from "../stores/config-store";

  import type { LintResult } from "../lib/ColorLint";
  import type { Palette } from "../types";

  import Tooltip from "../components/Tooltip.svelte";
  import PalDiff from "../components/PalDiff.svelte";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import {
    suggestLintAIFix,
    suggestLintFix,
  } from "../lib/linter-tools/lint-fixer";

  import { buttonStyle } from "../lib/styles";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  export let check: LintResult;
  export let customWord: string = "";
  export let positionAlongRightEdge: boolean = true;

  $: palette = $colorStore.palettes[$colorStore.currentPal];
  $: engine = $configStore.engine;
  $: suggestions = [] as Palette[];
  $: colorSpace = palette.colorSpace;

  function proposeFix(useAi: boolean = false) {
    requestState = "loading";
    let hasRetried = false;
    const getFix = () => {
      if (useAi) {
        return suggestLintAIFix(palette, check, engine).then((x) => {
          suggestions = x;
          requestState = "loaded";
        });
      } else {
        return suggestLintFix(palette, check, engine).then((x) => {
          suggestions = x;
          requestState = "loaded";
        });
      }
    };

    getFix().catch((e) => {
      console.log(e);
      if (!hasRetried) {
        requestState = "failed";
      } else {
        hasRetried = true;
        return getFix();
      }
    });
  }
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;

  const options = [
    "deuteranopia",
    "protanopia",
    "tritanopia",
    "grayscale",
  ] as const;
  $: cbMatch = options.find((x) =>
    check.name.toLowerCase().includes(x)
  ) as (typeof options)[number];
  const allowedColorSpaces = ["lch", "lab", "hsl", "hsv"] as const;
  $: spaceMatch = allowedColorSpaces.find(
    (x) => check.description.toLowerCase().includes(x) && x !== colorSpace
  ) as any;
  $: ignored = !!evalConfig[check.name]?.ignore;
</script>

<Tooltip {positionAlongRightEdge}>
  <div slot="content" let:onClick class="max-w-2xl eval-tooltip">
    <div class="font-bold">{check.name}</div>
    {#if check.passes || ignored}
      <div class="text-sm">{check.description}</div>
    {:else}
      <ExplanationViewer {check} />
    {/if}

    <div class="font-bold mt-4">Actions</div>
    {#if check.isCustom}
      <button
        class={buttonStyle}
        on:click={() => lintStore.setFocusedLint(check.isCustom)}
      >
        Customize
      </button>
    {/if}
    {#if cbMatch}
      <button
        class={buttonStyle}
        on:click={() => configStore.setColorSim(cbMatch)}
      >
        Activate {cbMatch} simulator
      </button>
    {/if}
    {#if !!spaceMatch}
      <button
        class={buttonStyle}
        on:click={() => colorStore.setColorSpace(spaceMatch)}
      >
        Switch to {spaceMatch} color space
      </button>
    {/if}

    {#if !check.passes}
      <button class={buttonStyle} on:click={() => proposeFix(true)}>
        Try to fix (AI)
      </button>
      {#if check.subscribedFix !== "none"}
        <button class={buttonStyle} on:click={() => proposeFix(false)}>
          Try to fix (hueristics)
        </button>
      {/if}
    {/if}

    {#if !ignored}
      <button
        class={buttonStyle}
        on:click={() => {
          colorStore.setCurrentPalEvalConfig({
            ...evalConfig,
            [check.name]: { ignore: true },
          });
        }}
      >
        Ignore for this palette
      </button>
    {:else}
      <button
        class={buttonStyle}
        on:click={() => {
          colorStore.setCurrentPalEvalConfig({
            ...evalConfig,
            [check.name]: { ignore: false },
          });
        }}
      >
        Re-enable
      </button>
    {/if}

    {#if requestState === "loading"}
      <div>Loading...</div>
    {:else if requestState === "failed"}
      <div>Failed to generate suggestions</div>
    {:else if requestState === "loaded"}
      {#each suggestions as suggestion}
        <div class="flex">
          <PalDiff beforePal={currentPal} afterPal={suggestion} />
          <div class="flex flex-col justify-between">
            <button
              class={buttonStyle}
              on:click={() => {
                if (suggestion) {
                  colorStore.setCurrentPal(suggestion);
                  focusStore.clearColors();
                  requestState = "idle";
                  suggestions = [];
                  onClick();
                }
              }}
            >
              Use
            </button>
            <button
              class={buttonStyle}
              on:click={() => {
                suggestions = suggestions.filter((x) => x !== suggestion);
                if (suggestions.length === 0) {
                  requestState = "idle";
                }
              }}
            >
              Reject
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
  <button
    slot="target"
    let:toggle
    class={customWord ? "" : `${buttonStyle}`}
    on:click|stopPropagation={toggle}
  >
    {#if customWord}
      {customWord}
    {:else if check.passes}info{:else}fixes{/if}
  </button>
</Tooltip>

<style>
  .eval-tooltip {
    min-width: 500px;
  }
</style>
