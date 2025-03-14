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

  function modifyLint(path: (number | string)[], newValue: any) {
    const lintObj = JSON.parse(lint);
    let current = lintObj;
    for (const key of path.slice(0, -1)) {
      current = current[key];
    }
    // for the case where the path is to a nested object, replace the key with the new key
    if (typeof current[path[path.length - 1]] === "object") {
      const newKey = newValue;
      const oldKey = path[path.length - 1];
      const newObj = {};
      for (const key of Object.keys(current[oldKey])) {
        newObj[key] = current[oldKey][key];
      }
      delete current[oldKey];
      current[newKey] = newObj;
    } else {
      current[path[path.length - 1]] = newValue;
    }
    lint = JSON.stringify(lintObj);
  }
  $: console.log(`${error}`);
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
    {#each executionLog || [] as log}
      <DispatchNode node={log} {pal} inducedVariables={{}} {modifyLint} />
    {/each}
  {/if}
</div>
