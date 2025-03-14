<script lang="ts">
  import type { LintProgram } from "color-buddy-palette-lint";
  import { makePalFromString, Color } from "color-buddy-palette";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import { generateTest } from "../lib/api-calls";
  import store from "../stores/store";

  export let lint: LintProgram;
  export let addNewTest: (test: LintProgram["expectedPassingTests"][0]) => void;

  let makingTest = false;
  let numColors = 1;
</script>

<Tooltip>
  <div slot="content">
    <button
      class={buttonStyle}
      on:click={() => {
        makingTest = true;
      }}
    >
      Generic Test
    </button>
    <button
      class={buttonStyle}
      on:click={() =>
        generateTest(lint.program, $store.engine, "passes").then(addNewTest)}
    >
      Generate using AI
    </button>
    {#if makingTest}
      <div>How many colors</div>
      <input type="number" min="1" max="10" bind:value={numColors} />
      <button
        class={buttonStyle}
        on:click={() => {
          makingTest = false;
        }}
      >
        Cancel
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          const colors = [];
          for (let i = 0; i < numColors; i++) {
            colors.push(
              Color.colorFromChannels(
                [255 * Math.random(), 255 * Math.random(), 255 * Math.random()],
                "rgb"
              ).toHex()
            );
          }
          addNewTest(makePalFromString(colors));
          makingTest = false;
        }}
      >
        Create
      </button>
    {/if}
  </div>
  <button slot="target" let:toggle class={buttonStyle} on:click={toggle}>
    (Add Test)
  </button>
</Tooltip>
