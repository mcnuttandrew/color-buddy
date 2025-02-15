<script lang="ts">
  import type { LintProgram, LintResult } from "color-buddy-palette-lint";
  import type { Palette } from "color-buddy-palette";
  import PalPreview from "../components/PalPreview.svelte";
  import store from "../stores/store";
  export let lint: LintProgram;
  import { runLint } from "../lib/utils";
  import VisualSummarizer from "./VisualSummarizer.svelte";
  import LintTest from "./LintTest.svelte";
  import { buttonStyle } from "../lib/styles";
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
  $: program = lint.program;
  let editTime: null | number = null;

  function updatePal(newPal: Palette) {
    if (!focusedTest) return;
    if (editTime === null) {
      editTime = Date.now();
      store.setOkayToExecute(false);
    }
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
    editTime = Date.now();
    setTimeout(() => {
      if (!editTime) {
        store.setOkayToExecute(true);
      } else if (Date.now() - editTime > 1000) {
        store.setOkayToExecute(true);
        editTime = null;
      }
    }, 1000);
  }
</script>

<div class="flex">
  <div>
    {#if currentLintAppliesToCurrentPalette && testPal}
      {#if lintResult.kind === "success" && lintResult.passes}
        <div class="text-green-500">
          This lint passes for the current palette
        </div>
      {/if}
      {#if lintResult.kind === "success" && !lintResult.passes && !errors}
        <div class="flex">
          <div class="text-red-500 mr-2">
            This lint fails for the current palette.
          </div>
        </div>
      {/if}
    {/if}

    <div class="border p-2 rounded">
      {#if testPal && focusedTest}
        <LintTest
          removeCase={() => {
            const newTests = [...lint.expectedPassingTests].filter(
              (_, i) => i !== focusedTest.index
            );
            store.setCurrentLintExpectedPassingTests(newTests);
          }}
          pal={testPal}
          {updatePal}
        />
      {/if}

      {#if currentLintAppliesToCurrentPalette && testPal}
        {#if lintResult.kind === "success" && !lintResult.passes && !errors}
          <div class="border">
            The following colors are blamed.
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
                  colors: blameData
                    .flatMap((x) => x)
                    .map((x) => testPal.colors[x]),
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
            Blame mode
          </div>
        {/if}
      {:else}
        <div class="text-red-500">
          This lint does not apply to the current palette due to a mismatch
          between its tags and the palette's tags. This lint requires the
          following tags: {lint.requiredTags.map((x) => `"${x}"`).join(", ")}.
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
  </div>
  <div class="w-full overflow-auto">
    {#if testPal}
      <VisualSummarizer lint={program} pal={testPal} />
    {/if}
  </div>
</div>
