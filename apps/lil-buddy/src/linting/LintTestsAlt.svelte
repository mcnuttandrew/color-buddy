<script lang="ts">
  import AddTest from "./AddTest.svelte";
  import type { LintProgram } from "color-buddy-palette-lint";
  import LintTest from "./LintTest.svelte";
  import { makePalFromString, Color } from "color-buddy-palette";

  import store from "../stores/store";
  import { doLint } from "../lib/utils";
  // import LintPicker from "./LintPicker.svelte";
  // import Nav from "../components/Nav.svelte";
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
      const newTests = [
        ...(passing ? lint.expectedPassingTests : lint.expectedFailingTests),
        newTest,
      ];

      if (passing) {
        store.setCurrentLintExpectedPassingTests(newTests);
      } else {
        store.setCurrentLintExpectedFailingTests(newTests);
      }
    };
  }
  function intRand(lower: number, upper: number) {
    return Math.floor((upper - lower) * Math.random() + lower);
  }

  function generateTestCases() {
    ["passing", "failing"].forEach((testType) => {
      const newTests = [...new Array(3)].map(() => {
        const numColors = intRand(3, 10);
        // build initial version of palette
        const colors = [];
        for (let i = 0; i < numColors; i++) {
          colors.push(
            Color.colorFromChannels(
              [255 * Math.random(), 255 * Math.random(), 255 * Math.random()],
              "rgb"
            ).toHex()
          );
        }
        const newPal = makePalFromString(colors);
        if (lint.requiredTags) {
          newPal.tags = [...(newPal.tags || []), ...lint.requiredTags];
        }
        if (lint.taskTypes.length !== 3) {
          newPal.type = lint.taskTypes[0];
        }

        // check to see if its working

        return newPal;
      });

      if (testType === "passing") {
        store.setCurrentLintExpectedPassingTests([
          ...newTests,
          ...lint.expectedPassingTests,
        ]);
      } else {
        store.setCurrentLintExpectedFailingTests([
          ...newTests,
          ...lint.expectedFailingTests,
        ]);
      }
    });
  }

  $: numPassing = passingTestResults.filter(
    (test) => test.result.kind === "success" && test.result.passes
  ).length;
  $: numFailing = failingTestResults.filter(
    (test) => test.result.kind === "success" && !test.result.passes
  ).length;
</script>

<div class="flex w-full justify-between">
  <div class="font-bold">Test Cases</div>
  <Tooltip>
    <div slot="content" class="">
      <div class=" w-full flex py-1 font-bold">Tests Cases</div>
      <div>Cases expected to be passing</div>
      <div class=" flex items-center overflow-auto">
        {#each passingTestResults as test, idx}
          <LintTest {idx} testResult={test} type={"passing"} />
        {/each}
        <AddTest {lint} addNewTest={addTest(true)} />
      </div>
      <div>Cases expected to be failing</div>
      <div class=" flex items-center overflow-auto">
        {#each failingTestResults as test, idx}
          <LintTest {idx} testResult={test} type={"failing"} />
        {/each}
        <AddTest {lint} addNewTest={addTest(false)} />
      </div>
      <button class="{buttonStyle} mt-4" on:click={generateTestCases}>
        Generate a handful of additional test cases
      </button>
    </div>
    <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
      Change Test Case
    </button>
  </Tooltip>
</div>
<div class=" mb-2">
  <div class="text-sm flex justify-between">
    <span class="flex">
      <div class="font-mono mr-1">{numPassing}/{passingTestResults.length}</div>
      passing cases
    </span>
    <span class="flex">
      <div class="font-mono mr-1">{numFailing}/{failingTestResults.length}</div>
      failing cases
    </span>
  </div>
</div>
