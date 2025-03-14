<script lang="ts">
  import AddTest from "./AddTest.svelte";
  import type { LintProgram } from "color-buddy-palette-lint";
  import LintTest from "./LintTest.svelte";
  import store from "../stores/store";
  import { runLint } from "../lib/utils";
  import type { TestResult } from "../lib/utils";
  export let lint: LintProgram;

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
  function addTest(passing: boolean) {
    return function (test: LintProgram["expectedPassingTests"][0]) {
      const newTest = { ...test };

      if (lint.requiredTags) {
        newTest.tags = [...(newTest.tags || []), ...lint.requiredTags];
      }
      if (lint.taskTypes.length !== 3) {
        newTest.type = lint.taskTypes[0];
      }
      const newTests = [...lint.expectedPassingTests, newTest];

      if (passing) {
        store.setCurrentLintExpectedPassingTests(newTests);
      } else {
        store.setCurrentLintExpectedFailingTests(newTests);
      }
    };
  }
</script>

<div class="border h-full">
  <div class="font-bold w-full bg-stone-100">Tests</div>
  <div class="flex flex-col px-2">
    <div class="flex flex-col">
      <div class="flex">
        <div class="font-bold">Expected Passing</div>
      </div>
      <div class="flex flex-wrap">
        {#each passingTestResults as test, idx}
          <LintTest {idx} testResult={test} type="passing" />
        {/each}
        <AddTest {lint} addNewTest={addTest(true)} />
      </div>
    </div>
    <div class="flex flex-col">
      <div class="flex">
        <div class="font-bold">Expected failing</div>
      </div>
      <div class="flex flex-wrap">
        {#each failingTestResults as test, idx}
          <LintTest {idx} testResult={test} type="failing" />
        {/each}
        <AddTest {lint} addNewTest={addTest(false)} />
      </div>
    </div>
  </div>
</div>
