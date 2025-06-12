<script lang="ts">
  import AddTest from "./AddTest.svelte";
  import type { LintProgram } from "color-buddy-palette-lint";
  import LintTest from "./LintTest.svelte";
  import store from "../stores/store";
  import { doLint } from "../lib/utils";
  import LintPicker from "./LintPicker.svelte";
  import Nav from "../components/Nav.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let lint: LintProgram;

  $: passingTestResults = (lint?.expectedPassingTests || []).map((x) =>
    doLint(x, lint)
  );
  $: failingTestResults = (lint?.expectedFailingTests || []).map((x) =>
    doLint(x, lint)
  );
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
  $: showWhichTests = $store.focusedTest ? $store.focusedTest.type : "passing";
  $: tests =
    showWhichTests === "passing" ? passingTestResults : failingTestResults;

  $: numPassing = passingTestResults.filter(
    (test) => test.result.kind === "success" && test.result.passes
  ).length;
  $: numFailing = failingTestResults.filter(
    (test) => test.result.kind === "success" && !test.result.passes
  ).length;
</script>

<Tooltip>
  <div slot="content" class="">
    <div class=" w-full flex px-2 py-1">
      <div class="font-bold">Tests Expected to be</div>
      <Nav
        tabs={["passing", "failing"]}
        isTabSelected={(x) => x === showWhichTests}
        selectTab={(x) => {
          showWhichTests = x;
        }}
        formatter={(x) => {
          const tests =
            x === "passing" ? passingTestResults : failingTestResults;
          const totalTests = tests.length;
          const numCorrect = x === "passing" ? numPassing : numFailing;
          return ` ${x} (${numCorrect}/${totalTests})`;
        }}
      />
    </div>
    <div class=" flex items-center overflow-auto">
      {#each tests as test, idx}
        <LintTest {idx} testResult={test} type={showWhichTests} />
      {/each}
      <AddTest {lint} addNewTest={addTest(showWhichTests === "passing")} />
    </div>
  </div>
  <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
    Change Test Case
  </button>
</Tooltip>
