<script lang="ts">
  import type { LintResult, Palette } from "@color-buddy/palette-lint";
  import { suggestLintFix } from "@color-buddy/palette-lint";
  import { suggestLintAIFix, suggestLintMonteFix } from "../lib/lint-fixer";

  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import lintStore from "../stores/lint-store";
  import configStore from "../stores/config-store";

  import Tooltip from "../components/Tooltip.svelte";
  import PalDiff from "../components/PalDiff.svelte";
  import ExplanationViewer from "./ExplanationViewer.svelte";

  import { buttonStyle } from "../lib/styles";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  export let check: LintResult;
  export let customWord: string = "";
  export let positionAlongRightEdge: boolean = true;

  $: palette = $colorStore.palettes[$colorStore.currentPal];
  $: engine = $configStore.engine;
  $: suggestions = [] as Palette[];
  $: colorSpace = palette.colorSpace;
  $: lint = $lintStore.lints.find((x) => x.id === check.id);

  function proposeFix(fixType: "ai" | "monte" | "heuristic") {
    requestState = "loading";
    let hasRetried = false;
    const getFix = () => {
      let fix;
      if (fixType === "ai") {
        fix = suggestLintAIFix(palette, check, engine);
      } else if (fixType === "monte" && lint) {
        fix = suggestLintMonteFix(palette, check, engine);
      } else {
        fix = suggestLintFix(palette, check, engine);
      }
      return fix.then((x) => {
        suggestions = [...suggestions, ...x];
        requestState = "loaded";
      });
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
    <div class="max-h-52 overflow-y-auto">
      {#if check.passes || ignored}
        <div class="text-sm">{check.description}</div>
      {:else}
        <ExplanationViewer {check} />
      {/if}
    </div>

    <div class="font-bold mt-4">Actions</div>
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
      <!-- hiding the LLM based solution, bc it works poorly -->
      <button class={buttonStyle} on:click={() => proposeFix("ai")}>
        Try to fix (LLM)
      </button>
      {#if lint}
        <button class={buttonStyle} on:click={() => proposeFix("monte")}>
          Try to fix (AI)
        </button>
      {/if}
      {#if check.subscribedFix !== "none"}
        <button class={buttonStyle} on:click={() => proposeFix("heuristic")}>
          Try to fix (ColorBuddy)
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
    {#if check.isCustom}
      <button
        class={buttonStyle}
        on:click={() => {
          lintStore.setFocusedLint(check.isCustom);
          configStore.setEvalDisplayMode("lint-customization");
        }}
      >
        Customize
      </button>
    {/if}

    {#if requestState === "loading"}
      <div>Loading...</div>
    {:else if requestState === "failed"}
      <div>Failed to generate suggestions</div>
    {/if}
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
