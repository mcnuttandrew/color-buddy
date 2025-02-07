<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  export let node: any;
  export let pal: Palette;

  let open = true;
</script>

<!-- only show it if its the evaluated version -->
{#if node.nodeType !== "quantifier"}
  <div class="flex items-center">
    <div class="flex flex-col">
      <button
        class="font-bold"
        on:click={() => {
          open = !open;
        }}
      >
        {node.quant} - {node.varb}
      </button>
      {#if open}
        <div class="bg-opacity-30 bg-slate-300 flex flex-col p-2">
          {#each node.results as result}
            <div class="flex items-center">
              <div class="flex">
                <div
                  class="h-8 w-8 rounded-full"
                  style={`background: ${result.color}`}
                />
                <div>→</div>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center">
                  {#if result.result === "WHERE SKIP"}
                    <div class="text-red-500">✗</div>
                    removed by where clause
                  {:else}
                    {#each result.evals as evaluation, idx}
                      <DispatchNode
                        node={evaluation}
                        {pal}
                        inducedVariables={evaluation.inducedVariables}
                      />
                      {#if idx < result.evals.length - 1}
                        <div>→</div>
                      {/if}
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
