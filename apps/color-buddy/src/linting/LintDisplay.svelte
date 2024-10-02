<script lang="ts">
  import type { LintResult } from "color-buddy-palette-lint";

  import Times from "virtual:icons/fa6-solid/xmark";
  import IgnoreIcon from "virtual:icons/fa6-solid/eye-slash";
  import Triangle from "virtual:icons/fa6-solid/triangle-exclamation";
  import Check from "virtual:icons/fa6-solid/check";
  import ChevDown from "virtual:icons/fa6-solid/chevron-down";

  import colorStore from "../stores/color-store";

  import { buttonStyle } from "../lib/styles";
  import LintToolTipContents from "./LintToolTipContents.svelte";
  import EvalResponse from "./EvalResponse.svelte";
  export let lintResult: LintResult;

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
  <div
    class="w-full rounded flex flex-col justify-between py-1"
    class:mb-4={showMessage}
  >
    <button
      class="flex items-center justify-between px-1"
      class:hover:bg-stone-300={lintResult.kind === "success"}
      on:click={() => {
        showMessage = !showMessage;
      }}
    >
      <div class="flex items-center">
        {#if lintResult.kind === "success"}
          <div class="h-6 w-5 flex items-center justify-center">
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
          </div>
        {/if}
      </div>
      <button class="text-left w-full px-2">
        {lintProgram.name}
      </button>
      <div><ChevDown class="h-4 w-4 text-sm" /></div>
    </button>
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
        <LintToolTipContents
          {lintResult}
          onClick={() => {
            showMessage = false;
          }}
          hideTitle
        />
      {:else}
        <div class="text-sm italic">{lintProgram.description}</div>
      {/if}
    {/if}
  </div>
{:else if lintResult.kind === "invalid"}
  <!-- do nothing -->
{/if}
