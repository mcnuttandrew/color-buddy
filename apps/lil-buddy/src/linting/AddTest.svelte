<script lang="ts">
  import type { LintProgram } from "color-buddy-palette-lint";
  import { makePalFromString } from "color-buddy-palette";
  import { buttonStyle } from "../lib/styles";

  export let currentTests: LintProgram["expectedPassingTests"];
  export let setNewTests: (tests: LintProgram["expectedPassingTests"]) => void;
</script>

<button
  class={buttonStyle}
  on:click={() => {
    const newTests = [...currentTests, makePalFromString(["steelblue"])];
    setNewTests(newTests);
  }}
>
  (Add Test)
</button>
