<script lang="ts">
  import type { CustomLint, Palette } from "@color-buddy/palette-lint";
  import { utils } from "@color-buddy/palette-lint";

  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import {} from "../lib/utils";

  export let currentPal: Palette;
  export let currentTests: CustomLint["expectedPassingTests"];
  export let setNewTests: (tests: CustomLint["expectedPassingTests"]) => void;
</script>

<Tooltip>
  <div slot="content" let:onClick>
    <button
      class={buttonStyle}
      on:click={() => {
        const newTests = [
          ...currentTests,
          utils.makePalFromString(["steelblue"]),
        ];
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
