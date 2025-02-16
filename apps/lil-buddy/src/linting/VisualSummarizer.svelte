<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./summary-nodes/DispatchNode.svelte";
  import {
    GenerateAST,
    smallStepEvaluator,
    rewriteQuantifiers,
  } from "color-buddy-palette-lint";
  import { trimTree } from "../lib/graph-builder";
  import store from "../stores/store";
  import { buttonStyle } from "../lib/styles";
  export let pal: Palette;
  export let lint: string;

  $: executionLog = getExecutionLog(lint, $store.okayToExecute);
  let error: any;
  function getExecutionLog(lint: string, okayToExecute: boolean) {
    try {
      const ast = (GenerateAST(JSON.parse(lint) as any).value as any)
        .children[0] as any;
      const rewrittenAST = trimTree(rewriteQuantifiers(ast));
      const result = smallStepEvaluator(rewrittenAST, {}, pal, true);
      error = null;
      return result;
    } catch (e) {
      console.error(e);
      error = e;
    }
  }
</script>

<div class="flex">
  {#if error}
    <div>{error}</div>
    <button
      class={buttonStyle}
      on:click={() => {
        executionLog = getExecutionLog(lint, $store.okayToExecute);
      }}
    >
      Try again
    </button>
  {:else}
    {#each executionLog || [] as log}
      <DispatchNode node={log} {pal} inducedVariables={{}} />
    {/each}
  {/if}
</div>
