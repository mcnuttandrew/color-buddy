<script lang="ts">
  import type { LintResult } from "color-buddy-palette-lint";

  import Times from "virtual:icons/fa6-solid/xmark";
  import IgnoreIcon from "virtual:icons/fa6-solid/eye-slash";
  import Triangle from "virtual:icons/fa6-solid/triangle-exclamation";
  import Check from "virtual:icons/fa6-solid/check";

  import colorStore from "../stores/color-store";

  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import EvalResponse from "./EvalResponse.svelte";
  export let lintResult: LintResult;
  export let justSummary: boolean = false;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: lintProgram = lintResult.lintProgram;
  $: ignoredColors = Object.entries(evalConfig)
    .filter(
      ([name, config]) =>
        (name.split("-?-")[1] || "").trim() === lintProgram.id && config.ignore
    )
    .map(([name]) => name.split("-?-")[0]);
  $: showMessage = false;
</script>

{#if lintResult.kind === "ignored"}
  <div class="text-xs flex items-center">
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalEvalConfig({
          ...evalConfig,
          [lintProgram.name]: { ignore: false },
        });
      }}
    >
      <IgnoreIcon class="h-3 w-3" />
    </button>
    {lintProgram.name}
    <EvalResponse {lintResult} customWord={"⚙️"} />
  </div>
{:else if lintResult.kind === "success"}
  {#if justSummary && lintResult}
    <EvalResponse {lintResult} customWord={"✅"} />
  {:else}
    <div class="w-full rounded flex flex-col justify-between py-1">
      <div class="flex items-center">
        {#if lintResult.kind === "success"}
          {#if lintResult?.passes}<div
              class="text-bf text-sm italic mr-2 text-green-500"
            >
              <Check />
            </div>
          {/if}
          {#if !lintResult.passes && lintProgram.level === "error"}
            <div class="text-bf text-sm italic mr-2 text-red-500">
              <Times />
            </div>
          {/if}
          {#if !lintResult.passes && lintProgram.level === "warning"}
            <div class="text-bf text-sm italic mr-2 text-yellow-400">
              <Triangle />
            </div>
          {/if}
        {/if}
        <EvalResponse {lintResult} />
        <button
          class:hover:bg-stone-300={lintResult.kind === "success"}
          on:click={() => {
            showMessage = !showMessage;
          }}
        >
          {lintProgram.name}
        </button>
      </div>
      {#if ignoredColors.length > 0}
        <div class="text-sm italic">
          Ignored colors for this lint:
          {#each ignoredColors as color}
            <div class="inline-block relative w-3 h-3 mx-1">
              <button
                on:click={() => {
                  colorStore.setCurrentPalEvalConfig({
                    ...evalConfig,
                    [`${color}-?-${lintProgram.id}`]: { ignore: false },
                  });
                }}
                class="rounded-full w-3 h-3 bottom-0 absolute inline-block opacity-100"
                style={`background: ${color}`}
              />
            </div>
          {/each}
          (click to re-enable)
        </div>
      {/if}
      {#if lintResult.kind === "success" && showMessage}
        {#if !lintResult.passes}
          <ExplanationViewer {lintResult} />
        {:else}
          <div class="text-sm italic">{lintProgram.description}</div>
        {/if}
      {/if}
    </div>
  {/if}
{:else if lintResult.kind === "invalid"}
  <!-- do nothing -->
{/if}
