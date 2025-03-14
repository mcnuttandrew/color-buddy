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
  import { modifyLint } from "../lib/utils";
  export let pal: Palette;
  export let lint: string;

  let processingState = "processing" as "ready" | "processing";
  $: executionLog = getExecutionLog(lint, $store.okayToExecute);
  let error: any;
  function getExecutionLog(lint: string, okayToExecute: boolean) {
    processingState = "processing";
    try {
      const ast = (GenerateAST(JSON.parse(lint) as any).value as any)
        .children[0] as any;
      const rewrittenAST = trimTree(rewriteQuantifiers(ast)).generatePath([]);
      const result = smallStepEvaluator(rewrittenAST, {}, pal, true);
      error = null;
      processingState = "ready";
      return result;
    } catch (e) {
      console.error(e);
      error = e;
      processingState = "ready";
    }
  }
</script>

<div class="flex">
  {#if processingState === "processing"}
    <div class="w-full flex flex-col items-center justify-center p-2">
      <div class="max-w-64">
        <div class="text-xl">Processing...</div>
      </div>
    </div>
  {:else if error}
    <div class="w-full flex flex-col items-center justify-center p-2">
      <div class="max-w-64">
        <div class="text-xl">{error}</div>
        <button
          class={buttonStyle}
          on:click={() => {
            executionLog = getExecutionLog(lint, $store.okayToExecute);
          }}
        >
          Try again
        </button>
        {#if `${error}` === "Error: Too many iterations"}
          <div class="text-yellow-500">
            When evaluating large palettes that have a lot of comparisons, the
            maximum can be unintentionally exceeded. Click this button to try to
            extend the maximum.
          </div>
        {/if}
      </div>
    </div>
  {:else}
    {#each executionLog || [] as log, idx}
      <div class="flex items-center">
        <DispatchNode
          node={log}
          {pal}
          inducedVariables={{}}
          modifyLint={(path, newVal) => {
            lint = modifyLint(path, newVal, lint);
          }}
        />
        {#if executionLog && idx !== executionLog.length - 1}
          <div class="">→</div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
