<script lang="ts">
  import AddTest from "./AddTest.svelte";
  import type { LintProgram, LintResult } from "color-buddy-palette-lint";
  import type { Palette } from "color-buddy-palette";
  import PalPreview from "../components/PalPreview.svelte";
  import store from "../stores/store";
  import { runLint } from "../lib/utils";
  export let lint: LintProgram;

  type TestResult = {
    pal: Palette;
    result: LintResult;
    blame: any;
  };
  // test results
  $: passingTestResults = (lint?.expectedPassingTests || []).map((pal) => {
    const result = runLint(lint, {}, pal).result;
    return {
      result,
      pal,
      blame: result.kind === "success" ? result?.blameData : [],
    };
  }) as TestResult[];
  $: failingTestResults = (lint?.expectedFailingTests || []).map((pal) => {
    const result = runLint(lint, {}, pal).result;
    return {
      result,
      pal,
      blame: result.kind === "success" ? result?.blameData : [],
    };
  }) as TestResult[];
</script>

<div class="border h-full">
  <div class="font-bold w-full bg-stone-100">Tests</div>
  <div class="flex flex-col px-2">
    <div class="flex flex-col">
      <div class="flex">
        <div class="font-bold">Expected Passing</div>
      </div>
      <div class="flex">
        {#each passingTestResults as passing, idx}
          <button
            class="flex border px-2 mx-2 rounded flex-col items-start"
            on:click={() => {
              store.setFocusedTest({ type: "passing", index: idx });
            }}
          >
            <div class="text-xs">
              {#if passing.result.kind === "success" && passing.result?.passes}
                <div class="text-green-500">Correct</div>
              {:else if passing.result.kind === "success"}
                <div class="text-red-500">Incorrect</div>
              {:else}
                <div class="text-yellow-500">{passing.result.kind}</div>
              {/if}
            </div>
            <PalPreview pal={passing.pal} showTags={true} />
          </button>
        {/each}
        <AddTest
          {lint}
          currentTests={lint.expectedPassingTests}
          setNewTests={(tests) =>
            store.setCurrentLintExpectedPassingTests(tests)}
        />
      </div>
    </div>
    <div class="flex flex-col">
      <div class="flex">
        <div class="font-bold">Expected failing</div>
      </div>
      <div class="flex">
        {#each failingTestResults as failing, idx}
          <button
            class="flex border px-2 mx-2 rounded flex-col items-start"
            on:click={() => {
              store.setFocusedTest({ type: "failing", index: idx });
            }}
          >
            <div class="text-xs">
              {#if failing.result.kind === "success" && !failing.result?.passes}
                <div class="text-green-500">Correct</div>
              {:else if failing.result.kind === "success"}
                <div class="text-red-500">Incorrect</div>
              {:else}
                <div class="text-yellow-500">{failing.result.kind}</div>
              {/if}
            </div>
            <PalPreview pal={failing.pal} showTags={true} />
          </button>
        {/each}
        <AddTest
          {lint}
          currentTests={lint.expectedFailingTests}
          setNewTests={(tests) =>
            store.setCurrentLintExpectedFailingTests(tests)}
        />
      </div>
    </div>
  </div>
</div>
