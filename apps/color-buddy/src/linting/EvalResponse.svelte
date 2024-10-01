<script lang="ts">
  import type { LintResult } from "color-buddy-palette-lint";
  import type { Palette } from "color-buddy-palette";
  import { suggestLintFix } from "color-buddy-palette-lint";
  import { suggestLintAIFix, suggestLintMonteFix } from "../lib/lint-fixer";
  import InfoIcon from "virtual:icons/fa6-solid/circle-info";
  import FixIcon from "virtual:icons/fa6-solid/hammer";
  import Equal from "virtual:icons/fa6-solid/equals";

  import { logEvent } from "../lib/api-calls";

  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import lintStore from "../stores/lint-store";
  import configStore from "../stores/config-store";

  import Tooltip from "../components/Tooltip.svelte";
  import PalDiff from "../components/PalDiff.svelte";
  import ExplanationViewer from "./ExplanationViewer.svelte";

  import { buttonStyle } from "../lib/styles";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  export let lintResult: LintResult;
  export let customWord: string = "";
  export let customWordIsImg: boolean = false;
  export let positionAlongRightEdge: boolean = true;

  $: palette = $colorStore.palettes[$colorStore.currentPal];
  $: engine = $configStore.engine;
  type FixSuggestion = { pal: Palette; label: string; fixesIssue: boolean };
  $: suggestions = [] as FixSuggestion[];
  $: colorSpace = palette.colorSpace;
  $: lintProgram = lintResult.lintProgram;

  function proposeFix(fixType: "ai" | "monte" | "heuristic", label: string) {
    let hasRetried = false;
    const getFix = () => {
      let fix;
      if (fixType === "ai") {
        fix = suggestLintAIFix(palette, lintResult, engine);
      } else if (fixType === "monte" && lintProgram) {
        fix = suggestLintMonteFix(palette, lintResult);
      } else {
        fix = suggestLintFix(palette, lintResult);
      }
      return fix
        .then((x) => x.map((pal) => ({ pal, label })).at(0))

        .then((x) => {
          suggestions = [...suggestions, x].filter((x) => x) as FixSuggestion[];
          requestState = "loaded";
          logEvent(
            "lint-fix",
            {
              fixType,
              errorName: lintProgram.name,
              lintProgram: lintProgram.program,
              palette: palette.colors.map((x) => x.toDisplay()),
              background: palette.background.toDisplay(),
              fix: x?.pal?.colors.map((z) => z.toDisplay()),
            },
            $configStore.userName
          );
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
  function generateFixes() {
    proposeFix("ai", "LLMs");
    if (lintProgram && lintProgram.program.length) {
      proposeFix("monte", "Monte Carlo");
    }
    if (lintProgram.subscribedFix && lintProgram.subscribedFix !== "none") {
      proposeFix("heuristic", "Hand tuned fix");
    }
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
    lintProgram.name.toLowerCase().includes(x)
  ) as (typeof options)[number];
  const allowedColorSpaces = ["lch", "lab", "hsl", "hsv"] as const;
  $: spaceMatch = allowedColorSpaces.find(
    (x) => lintProgram.description.toLowerCase().includes(x) && x !== colorSpace
  ) as any;
  $: ignored = !!evalConfig[lintProgram.name]?.ignore;
  $: blameData = Array.from(
    new Set((lintResult.kind === "success" ? lintResult.blameData : []).flat())
  );
</script>

<Tooltip {positionAlongRightEdge}>
  <div slot="content" let:onClick class="max-w-xl eval-tooltip">
    <div class="font-bold">{lintProgram.name}</div>
    <div class="max-h-52 overflow-y-auto">
      {#if lintResult.kind === "ignored" || (lintResult.kind === "success" && lintResult.passes)}
        <div class="text-sm">{lintProgram.description}</div>
      {:else}
        <ExplanationViewer {lintResult} />
      {/if}
    </div>
    <div class="my-2">
      {#if cbMatch}
        <button
          class={buttonStyle}
          on:click={() => configStore.setColorSim(cbMatch)}
        >
          Turn on {cbMatch} sim
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

      {#if lintResult.kind === "success" && !lintResult.passes}
        <button on:click={generateFixes} class={buttonStyle}>
          Suggest Fixes
        </button>
      {/if}

      {#if !ignored}
        <button
          class={buttonStyle}
          on:click={() => {
            colorStore.setCurrentPalEvalConfig({
              ...evalConfig,
              [lintProgram.name]: { ignore: true },
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
              [lintProgram.name]: { ignore: false },
            });
          }}
        >
          Re-enable
        </button>
      {/if}
      {#if !lintProgram.customProgram}
        <button
          class={buttonStyle}
          on:click={() => {
            lintStore.setFocusedLint(lintProgram.id);
            configStore.setEvalDisplayMode("check-customization");
          }}
        >
          Customize
        </button>
      {/if}
    </div>

    {#if blameData.length}
      <div class="text-xs">Ignore these colors for this check</div>
      {#each blameData as index}
        <button
          class={buttonStyle
            .split(" ")
            .filter((x) => x !== "opacity-50")
            .join(" ")}
          on:click={() => {
            colorStore.setCurrentPalEvalConfig({
              ...evalConfig,
              [`${palette.colors[index].toHex()}-?-${lintProgram.id}`]: {
                ignore: true,
              },
            });
          }}
        >
          <span class="opacity-50">
            {palette.colors[index].toHex()}
          </span>

          <div
            class="rounded-full w-3 h-3 ml-1 inline-block opacity-100"
            style={`background: ${palette.colors[index].toHex()}`}
          />
        </button>
      {/each}
    {/if}

    {#if requestState === "loading"}
      <div>Loading...</div>
    {:else if requestState === "failed"}
      <div>Failed to generate suggestions</div>
    {/if}
    {#if suggestions.length}
      <div class="text-sm mt-2 mb-1">Suggestions</div>
    {/if}
    <div class="max-h-40 overflow-auto">
      {#if suggestions.length > 0}
        <div class=" text-xs">Current</div>
        <div class="w-fit">
          <div
            class="rounded px-2 py-1 flex items-center"
            style={`background: ${currentPal.background.toHex()}`}
          >
            {#each currentPal.colors as color, idx}
              <div
                class="h-5 w-5 inline-block rounded-full mx-1"
                style={`background: ${color.toHex()}`}
              ></div>
            {/each}
          </div>
        </div>
      {/if}
      {#each suggestions as suggestion, idx}
        <div class=" text-xs">{suggestion.label}</div>
        <div class="flex relative mb-1 items-center">
          <div
            class="rounded px-2 py-1 flex items-center"
            style={`background: ${suggestion.pal.background.toHex()}`}
          >
            {#each suggestion.pal.colors as color, idx}
              <div
                class="h-5 w-5 rounded-full mx-1 flex items-center justify-center"
                style={`background: ${color.toHex()}`}
              >
                {#if color.toHex() === currentPal.colors[idx].toHex()}
                  <div
                    class:text-white={color.luminance() < 0.5}
                    class="text-xs"
                  >
                    <Equal />
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          <!-- <PalDiff beforePal={currentPal} afterPal={suggestion.pal} /> -->
          <!-- <div class="flex flex-col justify-between items-baseline"> -->
          <!-- <div class="font-bold pl-2 mb-0"> -->
          <!-- {suggestion.label} fix
            </div> -->
          <button
            class={buttonStyle}
            on:click={() => {
              if (suggestion) {
                colorStore.setCurrentPal(suggestion.pal);
                focusStore.clearColors();
                requestState = "idle";
                suggestions = [];
                onClick();
              }
            }}
          >
            Use
          </button>
          <!-- <button
              class={buttonStyle}
              on:click={() => {
                suggestions = suggestions.filter((_, jdx) => jdx !== idx);
                if (suggestions.length === 0) {
                  requestState = "idle";
                }
              }}
            >
              Reject
            </button> -->
          <!-- </div> -->
        </div>
      {/each}
    </div>
  </div>
  <button
    slot="target"
    let:toggle
    class={"flex items-center"}
    on:click|stopPropagation={toggle}
  >
    {#if customWord && !customWordIsImg}
      {customWord}
    {:else if customWord && customWordIsImg}
      <img src={customWord} class="h-4" alt={`Logo for ${customWord} checks`} />
    {:else if lintResult.kind === "success" && lintResult.passes}
      <InfoIcon class="h-4 w-4 mx-2 text-sm" />{:else}<FixIcon
        class="h-4 w-4 mx-2 text-sm"
      />{/if}
  </button>
</Tooltip>

<style>
  .eval-tooltip {
    min-width: 500px;
  }
</style>
