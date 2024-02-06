<script lang="ts">
  import colorStore from "../stores/color-store";
  import lintStore from "../stores/lint-store";
  import { ColorLint } from "../lib/lints/ColorLint";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import EvalResponse from "./EvalResponse.svelte";
  export let check: ColorLint<any, any>;
  export let justSummary: boolean = false;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: ignored = !!evalConfig[check.name]?.ignore;
</script>

{#if justSummary}
  <Tooltip buttonName="✅">
    <div slot="content" class="flex flex-col max-w-md">
      <div class="font-bold">{check.name}</div>
      <div class="">{check.description}</div>
    </div>
  </Tooltip>
{:else if ignored}
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
      re-enable
    </button>
    {#if check.isCustom}
      <button
        class={buttonStyle}
        on:click={() => {
          // @ts-ignore
          lintStore.setFocusedLint(check.isCustom);
        }}
      >
        customize
      </button>
    {/if}
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
      <Tooltip buttonName="info">
        <div slot="content" class="flex flex-col max-w-md">
          <div class="">{check.description}</div>
        </div>
      </Tooltip>
      {#if !check.passes}
        <EvalResponse {check} />
      {/if}
      {#if check.isCustom}
        <button
          class={buttonStyle}
          on:click={() => {
            // @ts-ignore
            lintStore.setFocusedLint(check.isCustom);
          }}
        >
          customize
        </button>
      {/if}
    </div>
    {#if !check.passes}
      <ExplanationViewer {check} />
    {/if}
  </div>
{/if}
