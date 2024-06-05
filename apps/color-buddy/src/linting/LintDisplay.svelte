<script lang="ts">
  import type { LintResult } from "@color-buddy/palette-lint";

  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import EvalResponse from "./EvalResponse.svelte";
  export let check: LintResult;
  export let justSummary: boolean = false;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: ignored = !!evalConfig[check.name]?.ignore;
  $: isCompact = $configStore.evalDisplayMode === "compact";
</script>

{#if justSummary}
  <EvalResponse {check} customWord={"✅"} />
{:else if ignored}
  <div class="text-xs flex">
    Ignored "{check.name}"
    <EvalResponse {check} customWord={"⚙️"} />
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalEvalConfig({
          ...evalConfig,
          [check.name]: { ignore: false },
        });
      }}
    >
      re-enable
    </button>
  </div>
{:else}
  <div class="w-full rounded flex flex-col justify-between py-1">
    <div class="flex items-center">
      {#if check.passes}<div class="text-bf text-sm italic mr-2 text-green-500">
          Pass
        </div>
      {/if}
      {#if !check.passes && check.level === "error"}
        <div class="text-bf text-sm italic mr-2 text-red-500">Fail</div>
      {/if}
      {#if !check.passes && check.level === "warning"}
        <div class="text-bf text-sm italic mr-2 text-yellow-400">Warning</div>
      {/if}
      <div class:font-bold={!check.passes}>
        {check.name}
      </div>
      <EvalResponse {check} />
    </div>
    {#if !check.passes && !isCompact}
      <ExplanationViewer {check} />
    {/if}
  </div>
{/if}
