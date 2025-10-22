<script lang="ts">
  import { suggestMCFix } from "color-buddy-palette-lint";
  import type { LintProgram } from "color-buddy-palette-lint";
  import type { Palette } from "color-buddy-palette";

  import { buttonStyle } from "../lib/styles";

  export let pal: Palette;
  export let type: "passing" | "failing";
  export let isCorrect: boolean;
  export let lint: LintProgram;
  export let onFix: (fixedPal: Palette) => void;

  let mcState = "ready" as "ready" | "loading" | "error";
</script>

{#if !isCorrect}
  <button
    class={buttonStyle}
    on:click={async () => {
      mcState = "loading";
      if (!lint) return;
      const program = lint.program;
      let parsedProgram = JSON.parse(program);
      if (type === "failing") {
        parsedProgram = { not: parsedProgram };
        lint.program = JSON.stringify(parsedProgram);
      }
      // sleep 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const fix = await suggestMCFix(pal, [lint]);
      lint.program = program;
      if (fix) {
        onFix(fix);

        mcState = "ready";
      } else {
        console.log("no fix found");
        mcState = "error";
      }
    }}
  >
    {#if mcState === "loading"}
      Processing
    {:else if mcState === "error"}
      No fix found
    {:else}
      Attempt to fix
    {/if}
  </button>
{/if}
