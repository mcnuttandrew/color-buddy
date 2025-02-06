<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./summary-nodes/DispatchNode.svelte";
  import { GenerateAST } from "color-buddy-palette-lint";
  import {
    generateEvaluations,
    rewriteQuantifiers,
  } from "../lib/small-step-evaluator";
  import store from "../stores/store";
  export let pal: Palette;
  export let lint: string;

  $: executionLog = getExecutionLog(lint, $store.okayToExecute);
  let error: any;
  function getExecutionLog(lint: string, okayToExecute: boolean) {
    if (!okayToExecute) {
      error = "Changes in process";
      return null;
    }
    try {
      const ast = (GenerateAST(JSON.parse(lint) as any).value as any)
        .children[0] as any;
      const rewrittenAST = rewriteQuantifiers(ast);
      const result = generateEvaluations(rewrittenAST, {}, pal, true);
      error = null;
      return result;
    } catch (e) {
      console.error(e);
      error = e;
    }
  }
  $: console.log("summarizer", $store.okayToExecute, executionLog);
</script>

<div class="flex">
  {#if error}
    <div>{error}</div>
  {:else}
    {#each executionLog || [] as log}
      <DispatchNode node={log} {pal} />
    {/each}
  {/if}
</div>
