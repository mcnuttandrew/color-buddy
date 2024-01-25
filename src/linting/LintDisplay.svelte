<script lang="ts">
  import colorStore from "../stores/color-store";
  import { ColorLint } from "../lib/lints/ColorLint";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import EvalResponse from "./EvalResponse.svelte";
  export let check: ColorLint<any, any>;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: ignored = !!evalConfig[check.name]?.ignore;
</script>

{#if ignored}
  <div class="text-xs">
    Ignored "{check.name}"
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalEvalConfig({
          ...evalConfig,
          [check.name]: { ignore: false },
        });
      }}
    >
      renable
    </button>
  </div>
{:else}
  <div class="w-full rounded flex flex-col justify-between py-1">
    <div class="flex items-center">
      {#if check.passes}<div class="text-bf text-sm italic mr-2 text-green-500">
          Pass
        </div>{/if}
      {#if !check.passes}
        <div class="text-bf text-sm italic mr-2 text-red-500">Fail</div>{/if}
      <div class:font-bold={!check.passes}>
        {check.name}
      </div>
      <Tooltip buttonName="info">
        <div slot="content" class="flex flex-col max-w-md">
          <div class="">{check.description}</div>
        </div>
      </Tooltip>
      {#if !check.passes}
        <EvalResponse {check} />
      {/if}
    </div>
    {#if !check.passes}
      <ExplanationViewer {check} />
    {/if}
  </div>
{/if}
