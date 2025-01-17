<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./summary-nodes/DispatchNode.svelte";
  import type { LintProgram } from "color-buddy-palette-lint";
  import { GenerateAST } from "color-buddy-palette-lint";
  export let lint: string;
  export let pal: Palette;

  $: ast = getAST();
  let error: any;
  function getAST() {
    try {
      return GenerateAST(JSON.parse(lint)).value as any;
    } catch (e) {
      error = e;
    }
  }
  $: console.log("summarizer");
</script>

<!-- <VisualSummaryNode node={ast} {pal} /> -->

{#if error}
  <div>{error}</div>
{:else}
  <DispatchNode node={ast} {pal} />
{/if}
