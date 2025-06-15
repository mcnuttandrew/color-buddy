<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./summary-nodes/DispatchNode.svelte";
  import {
    GenerateAST,
    smallStepEvaluator,
    rewriteQuantifiers,
    pruneUnfinishedNodes,
  } from "color-buddy-palette-lint";
  import { trimTree } from "../lib/graph-builder";
  import store from "../stores/store";
  import { buttonStyle } from "../lib/styles";
  import { modifyLint, JSONStringify } from "../lib/utils";
  export let pal: Palette;
  export let lint: string;

  let processingState = "processing" as "ready" | "processing";
  $: executionLog = getExecutionLog(lint, pal);
  let error: any;
  $: attempts = 0;
  function getExecutionLog(lint: string, pal: Palette) {
    processingState = "processing";
    try {
      const ast = (GenerateAST(JSON.parse(lint) as any).value as any)
        .children[0] as any;
      const rewrittenAST = trimTree(rewriteQuantifiers(ast)).generatePath([]);
      const result = pruneUnfinishedNodes(
        smallStepEvaluator(rewrittenAST, {}, pal, true)
      );
      error = null;
      processingState = "ready";
      attempts = 0;
      return result;
    } catch (e: any) {
      console.error(e);
      error = e;
      processingState = "ready";
      if (e.message.includes("Too many iterations")) {
        // If the error is due to too many iterations, we can try to extend the maximum
        attempts += 1;
        if (attempts < 3) {
          return getExecutionLog(lint, pal);
        }
      }
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
            executionLog = getExecutionLog(lint, pal);
          }}
        >
          Try again
        </button>
        {#if `${error}` === "Error: Too many iterations"}
          <div class="text-yellow-500">
            When evaluating larger palettes that have a lot of comparisons, the
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
            store.setCurrentLintProgram(
              JSONStringify(modifyLint(path, newVal, lint))
            );
          }}
        />
        {#if executionLog && idx !== executionLog.length - 1}
          <div class="">→</div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
