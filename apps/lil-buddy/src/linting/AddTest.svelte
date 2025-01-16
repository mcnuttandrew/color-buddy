<script lang="ts">
  import type { LintProgram } from "color-buddy-palette-lint";
  import { makePalFromString } from "color-buddy-palette";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import { generateTest } from "../lib/api-calls";
  import store from "../stores/store";

  export let lint: LintProgram;
  export let currentTests: LintProgram["expectedPassingTests"];
  export let setNewTests: (tests: LintProgram["expectedPassingTests"]) => void;
</script>

<Tooltip>
  <div slot="content">
    <button
      class={buttonStyle}
      on:click={() => {
        const newTests = [...currentTests, makePalFromString(["steelblue"])];
        setNewTests(newTests);
      }}
    >
      Generic Test
    </button>
    <button
      class={buttonStyle}
      on:click={() => {
        generateTest(lint.program, $store.engine, "passes").then((newTest) => {
          const newTests = [...currentTests, newTest];
          setNewTests(newTests);
        });
      }}
    >
      Generate using AI
    </button>
  </div>
  <button slot="target" let:toggle class={buttonStyle} on:click={toggle}>
    (Add Test)
  </button>
</Tooltip>
