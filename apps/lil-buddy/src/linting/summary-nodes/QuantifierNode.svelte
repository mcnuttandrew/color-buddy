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
      <div class="w-full bg-stone-200 flex justify-between items-center">
        <div class="font-bold">
          {#if node.quant === "all"}For all{:else}There exists{/if}
          {node.varb}
          the following should be true
        </div>
        <button on:click={() => (open = !open)}>
          <div>{open ? "▼" : "▶"}</div>
        </button>
      </div>
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
