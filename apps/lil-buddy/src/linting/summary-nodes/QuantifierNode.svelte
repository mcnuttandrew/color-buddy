<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  import NodeWrap from "./NodeWrap.svelte";
  export let node: any;
  export let pal: Palette;
  export let inducedVariables: Record<string, any> = {};
  export let modifyLint: (path: (number | string)[], newValue: any) => void;

  let open = true;
</script>

<!-- only show it if its the evaluated version -->
{#if node.nodeType !== "quantifier"}
  <div class="flex items-center border">
    <div class="flex flex-col">
      <div class="px-2 w-full bg-slate-700 flex items-center mt-1 text-white">
        <button on:click={() => (open = !open)}>
          <div>{open ? "▼" : "▶"}</div>
        </button>
        <div class="">
          {#if node.quant === "all"}For all the colors below, each color {node.varb},{:else}There
            should exist at least one color, {node.varb} where{/if}
          the following should be true
        </div>
      </div>
      {#if open}
        <div class="bg-opacity-30 bg-slate-200 flex flex-col p-2">
          {#each node.results as result}
            <div class="flex items-center">
              <div class="flex">
                <!-- possible this could be a number or something else -->
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
                    <NodeWrap
                      label="removed by where clause"
                      node={null}
                      {modifyLint}
                      options={null}
                      classes=""
                      comment="This color or combination of colors was removed by a where clause. This means it is not relevant to the quantifier."
                    />
                  {:else}
                    {#each result.evals as evaluation, idx}
                      <DispatchNode
                        {modifyLint}
                        node={evaluation}
                        {pal}
                        inducedVariables={{
                          ...inducedVariables,
                          ...evaluation.inducedVariables,
                        }}
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
