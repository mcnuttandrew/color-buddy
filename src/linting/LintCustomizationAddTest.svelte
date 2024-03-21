<script lang="ts">
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import { makePalFromString } from "../lib/utils";
  import type { CustomLint } from "../lib/ColorLint";
  import type { Palette } from "../types";

  export let currentPal: Palette;
  export let currentTests: CustomLint["expectedPassingTests"];
  export let setNewTests: (tests: CustomLint["expectedPassingTests"]) => void;
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
