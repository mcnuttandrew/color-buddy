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
      <div class="flex flex-wrap">
        {#each failingTestResults as test, idx}
          <LintTest {idx} testResult={test} type="failing" />
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
