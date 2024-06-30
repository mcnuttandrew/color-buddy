<script lang="ts">
  import type { LintResult } from "@color-buddy/palette-lint";

  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import EvalResponse from "./EvalResponse.svelte";
  export let lintResult: LintResult | undefined;
  export let lintProgram: LintResult["lintProgram"];
  export let justSummary: boolean = false;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: ignored = !lintResult || !!evalConfig[lintProgram.name]?.ignore;
  $: isCompact = $configStore.evalDisplayMode === "compact";
</script>

{#if !lintResult}
  <div class="text-xs flex">
    Ignored "{lintProgram.name}"
    <EvalResponse {lintResult} {lintProgram} customWord={"⚙️"} />
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
{:else}
  <!-- asd -->
  {#if justSummary && lintResult}
    <EvalResponse {lintResult} {lintProgram} customWord={"✅"} />
  {:else}
    <div class="w-full rounded flex flex-col justify-between py-1">
      <div class="flex items-center">
        {#if lintResult?.passes}<div
            class="text-bf text-sm italic mr-2 text-green-500"
          >
            Pass
          </div>
        {/if}
        {#if lintResult && !lintResult.passes && lintProgram.level === "error"}
          <div class="text-bf text-sm italic mr-2 text-red-500">Fail</div>
        {/if}
        {#if lintResult && !lintResult.passes && lintProgram.level === "warning"}
          <div class="text-bf text-sm italic mr-2 text-yellow-400">Warning</div>
        {/if}
        <div class:font-bold={lintResult && !lintResult.passes}>
          {lintProgram.name}
        </div>
        <EvalResponse {lintResult} {lintProgram} />
      </div>
      {#if lintResult && !lintResult.passes && !isCompact}
        <ExplanationViewer check={lintResult} />
      {/if}
    </div>
  {/if}
{/if}
