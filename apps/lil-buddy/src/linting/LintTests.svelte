<script lang="ts">
  import AddTest from "./AddTest.svelte";
  import type { LintProgram } from "color-buddy-palette-lint";
  import LintTest from "./LintTest.svelte";
  import store from "../stores/store";
  import { runLint } from "../lib/utils";
  import type { TestResult } from "../lib/utils";
  import Nav from "../components/Nav.svelte";
  export let lint: LintProgram;

  function doLint(pal: LintProgram["expectedPassingTests"][0]): TestResult {
    const result = runLint(lint, {}, pal).result;
    const blame = result.kind === "success" ? result?.blameData : [];
    return { result, pal, blame };
  }
  $: passingTestResults = (lint?.expectedPassingTests || []).map(doLint);
  $: failingTestResults = (lint?.expectedFailingTests || []).map(doLint);
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
  $: showWhichTests = "passing" as "passing" | "failing";
  $: tests =
    showWhichTests === "passing" ? passingTestResults : failingTestResults;
</script>

<div class="border">
  <div class="font-bold w-full bg-stone-200 flex justify-between px-2 py-1">
    <div>Tests</div>
    <AddTest {lint} addNewTest={addTest(showWhichTests === "passing")} />
    <Nav
      tabs={["passing", "failing"]}
      isTabSelected={(x) => x === showWhichTests}
      selectTab={(x) => {
        showWhichTests = x;
      }}
      formatter={(x) => {
        const tests = x === "passing" ? passingTestResults : failingTestResults;
        const totalTests = tests.length;
        const numCorrect = tests.filter((test) => {
          if (test.result.kind !== "success") return false;
          return x === "passing" ? test.result?.passes : !test.result?.passes;
        }).length;
        return `Expected to be ${x} (${numCorrect}/${totalTests})`;
      }}
    />
  </div>
  <div class="bg-stone-100 flex flex-wrap">
    {#each tests as test, idx}
      <LintTest {idx} testResult={test} type={showWhichTests} />
    {/each}
  </div>
</div>
