<script lang="ts">
  import type { LintProgram, LintResult } from "color-buddy-palette-lint";
  import PalPreview from "../components/PalPreview.svelte";
  import store from "../stores/store";
  export let lint: LintProgram;
  import { runLint } from "../lib/utils";
  import VisualSummarizer from "./VisualSummarizer.svelte";
  $: focusedTest = $store.focusedTest;
  $: testPal = focusedTest
    ? focusedTest.type === "passing"
      ? lint.expectedPassingTests[focusedTest.index]
      : lint.expectedFailingTests[focusedTest.index]
    : null;
  $: blameMode = {
    computeBlame: lint.blameMode !== "none",
  };
  const nullLint = {
    result: { kind: "invalid" } as LintResult,
    error: null,
  } as any as ReturnType<typeof runLint>;
  $: lintRun = testPal ? handleLint(lint, blameMode, testPal) : nullLint;
  function handleLint(lint: LintProgram, blameMode: any, testPal: any) {
    try {
      return runLint(lint, blameMode, testPal);
    } catch (e) {
      console.error(e);
      return nullLint;
    }
  }
  $: lintResult = lintRun.result;

  $: currentLintAppliesToCurrentPalette = (lint?.requiredTags || []).every(
    (tag) =>
      testPal?.tags.map((x) => x.toLowerCase()).includes(tag.toLowerCase())
  );

  $: blameData = (lintResult.kind === "success" && lintResult.blameData) || [];
  $: errors = lintRun.errors;
  $: pairData = blameData as number[][];
</script>

{#if testPal}
  <VisualSummarizer lint={lint.program} pal={testPal} />
{/if}
{#if currentLintAppliesToCurrentPalette && testPal}
  <PalPreview pal={{ ...testPal }} />
  {#if lintResult.kind === "success" && lintResult.passes}
    <div class="text-green-500">This lint passes for the current palette</div>
  {/if}
  {#if lintResult.kind === "success" && !lintResult.passes && !errors}
    <div>
      <div class="flex">
        <div class="text-red-500 mr-2">
          This lint fails for the current palette.
        </div>
        The following colors are blamed. Using
        <select
          value={lint.blameMode}
          class="mx-2"
          on:change={() => {
            // @ts-ignore
            store.setCurrentLintBlameMode(event.target.value);
          }}
        >
          <option>none</option>
          <option>single</option>
          <option>pair</option>
        </select>
        Blame mode
      </div>
      {#if lint.blameMode === "pair"}
        <div class="flex flex-wrap">
          {#each pairData as pair}
            <div class="mr-2 mb-1 border-2 border-black rounded">
              <PalPreview
                pal={{
                  ...testPal,
                  colors: pair.map((x) => testPal.colors[x]),
                }}
              />
            </div>
          {/each}
        </div>
      {:else}
        <PalPreview
          pal={{
            ...testPal,
            colors: blameData.flatMap((x) => x).map((x) => testPal.colors[x]),
          }}
        />
      {/if}
    </div>
  {/if}
{:else}
  <div class="text-red-500">
    This lint does not apply to the current palette due to a mismatch between
    its tags and the palette's tags
  </div>
{/if}
