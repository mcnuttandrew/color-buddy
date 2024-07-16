<script lang="ts">
  import type { LintProgram } from "color-buddy-palette-lint";
  import { makePalFromString } from "color-buddy-palette";
  import type { Palette } from "color-buddy-palette";

  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import {} from "../lib/utils";

  export let currentPal: Palette;
  export let currentTests: LintProgram["expectedPassingTests"];
  export let setNewTests: (tests: LintProgram["expectedPassingTests"]) => void;
</script>

<Tooltip>
  <div slot="content" let:onClick>
    <button
      class={buttonStyle}
      on:click={() => {
        const newTests = [...currentTests, makePalFromString(["steelblue"])];
        setNewTests(newTests);
        onClick();
      }}
    >
      From blank
    </button>
    <button
      class={buttonStyle}
      on:click={() => {
        const newTests = [...currentTests, currentPal];
        setNewTests(newTests);
        onClick();
      }}
    >
      From current palette
    </button>
  </div>
  <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
    (Add Test)
  </button>
</Tooltip>
