<script lang="ts">
  import type { LintResult, LintProgram } from "@color-buddy/palette-lint";

  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import EvalResponse from "./EvalResponse.svelte";
  export let lintResult: LintResult;
  export let justSummary: boolean = false;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: lintProgram = lintResult.lintProgram;
  $: isCompact = $configStore.evalDisplayMode === "compact";
</script>

{#if lintResult.kind === "ignored"}
  <div class="text-xs flex">
    Ignored "{lintProgram.name}"
    <EvalResponse {lintResult} customWord={"⚙️"} />
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalEvalConfig({
          ...evalConfig,
          [lintProgram.name]: { ignore: false },
        });
      }}
    >
      re-enable
    </button>
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
              Pass
            </div>
          {/if}
          {#if !lintResult.passes && lintProgram.level === "error"}
            <div class="text-bf text-sm italic mr-2 text-red-500">Fail</div>
          {/if}
          {#if !lintResult.passes && lintProgram.level === "warning"}
            <div class="text-bf text-sm italic mr-2 text-yellow-400">
              Warning
            </div>
          {/if}
        {/if}
        <div
          class:font-bold={lintResult.kind === "success" && !lintResult.passes}
        >
          {lintProgram.name}
        </div>
        <EvalResponse {lintResult} />
      </div>
      {#if lintResult.kind === "success" && !lintResult.passes && !isCompact}
        <ExplanationViewer {lintResult} />
      {/if}
    </div>
  {/if}
{:else if lintResult.kind === "invalid"}
  <!-- do nothing -->
{/if}
