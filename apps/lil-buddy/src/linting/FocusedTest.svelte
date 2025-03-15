<script lang="ts">
  import type { LintProgram, LintResult } from "color-buddy-palette-lint";
  import type { Palette } from "color-buddy-palette";
  import { Color } from "color-buddy-palette";
  import PalPreview from "../components/PalPreview.svelte";
  import store from "../stores/store";
  import ModifyPalette from "./ModifyPalette.svelte";
  export let lint: LintProgram;
  import { runLint, getFocusedTestPal } from "../lib/utils";

  import CurrentPal from "./CurrentPal.svelte";
  import { buttonStyle } from "../lib/styles";
  $: focusedTest = $store.focusedTest;
  $: testPal = getFocusedTestPal(lint, focusedTest);

  $: blameMode = {
    computeBlame: lint.blameMode !== "none",
    debugCompare: false,
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

  function updatePal(newPal: Palette) {
    if (!focusedTest) return;
    const oldTests =
      focusedTest.type === "passing"
        ? lint.expectedPassingTests
        : lint.expectedFailingTests;
    const newTests = [...oldTests];
    newTests[focusedTest.index] = newPal;
    if (focusedTest.type === "passing") {
      store.setCurrentLintExpectedPassingTests(newTests);
    } else {
      store.setCurrentLintExpectedFailingTests(newTests);
    }
  }
</script>

{#if testPal && focusedTest}
  <div class="">
    <CurrentPal pal={testPal} {updatePal} />
    <div class="flex flex-col mt-1">
      <div class="text-xs">Palette Type</div>
      <select
        class="bg-white border px-2 py-1 rounded"
        value={testPal.type}
        on:change={(e) => {
          // @ts-ignore
          const val = e.target.value;
          updatePal({ ...testPal, type: val });
        }}
      >
        <option value="sequential">Sequential</option>
        <option value="diverging">Diverging</option>
        <option value="categorical">Categorical</option>
      </select>
    </div>
  </div>
  <div class="text-xs">Controls</div>
  <div class="flex flex-wrap">
    <button
      class={buttonStyle}
      on:click={() => {
        const newColors = [
          ...testPal.colors,
          Color.colorFromString("steelblue"),
        ];
        updatePal({ ...testPal, colors: newColors });
      }}
    >
      Add Color
    </button>
    <ModifyPalette palette={testPal} {updatePal} />
  </div>
{/if}
<div class="text-xs">
  {#if lintResult.kind === "success" && !errors}
    <div
      class:text-green-500={lintResult.passes}
      class:text-red-500={!lintResult.passes}
    >
      This lint {lintResult.passes ? "passes" : "fails"} for the current palette
    </div>
  {:else if errors}
    <div class="text-red-500">
      There was an error running this lint: {errors.join(", ")}
    </div>
  {:else}
    <div class="text-yellow-500">
      This lint is invalid for the current palette
    </div>
  {/if}
</div>
<div class="">
  <!-- blame -->
  {#if currentLintAppliesToCurrentPalette && testPal}
    {#if lintResult.kind === "success" && !lintResult.passes && !errors}
      <div class=" py-1">
        <div class="font-bold">Blame</div>
        <div class="text-xs">
          These {lint.blameMode === "single" ? "colors" : "pairs of colors"} are
          automatically identified as being responsible for the failure
        </div>
        {#if lint.blameMode === "pair"}
          <div class="flex flex-wrap">
            {#each pairData as pair}
              <div class="mr-2 mb-1 border rounded">
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
        Using
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
        mode
      </div>
    {/if}
  {:else}
    <div class="text-red-500 text-sm">
      This lint does not apply to the current palette due to a mismatch between
      its tags and the palette's tags. This lint requires the following tags: {lint.requiredTags
        .map((x) => `"${x}"`)
        .join(", ")}.
      {#if testPal?.tags?.length}
        The palette has the following tags: {(testPal?.tags || [])
          .map((x) => `"${x}"`)
          .join(", ")}
      {:else}
        The palette has no tags.
      {/if}
      {#if testPal}
        <button
          class={buttonStyle}
          on:click={() => {
            updatePal({
              ...testPal,
              tags: [...new Set([...testPal.tags, ...lint.requiredTags])],
            });
          }}
        >
          Add Required Tags
        </button>
      {/if}
    </div>
  {/if}
</div>
