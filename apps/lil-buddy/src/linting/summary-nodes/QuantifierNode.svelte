<script lang="ts">
  import store from "../../stores/store";
  import DispatchNode from "./DispatchNode.svelte";
  import NodeWrap from "./NodeWrap.svelte";
  import type { SummaryNodeProps } from "./summary-node";
  export let props: SummaryNodeProps;

  let open = true;
</script>

<!-- only show it if its the evaluated version -->
{#if props.node.nodeType !== "quantifier"}
  <div class="flex items-center border">
    <div class="flex flex-col">
      <div class="px-2 w-full bg-slate-700 flex items-center mt-1 text-white">
        <button on:click={() => (open = !open)}>
          <div>{open ? "▼" : "▶"}</div>
        </button>
        <div class="">
          {#if props.node.quant === "all"}For all the colors below, each color {props
              .node.varb},{:else}There should exist at least one color, {props
              .node.varb} where{/if}
          the following should be true
        </div>
      </div>
      {#if open}
        <div class="bg-opacity-30 bg-slate-200 flex flex-col p-2">
          {#each props.node.results as result, idx}
            <div class="flex items-center">
              <div class="flex">
                <NodeWrap
                  props={{
                    ...props,
                    modifyLint: (_path, newValue) =>
                      store.updateColorInCurrentTest(idx, newValue),
                  }}
                  path={["fake path", "path"]}
                  options={"color"}
                  specificValue={result.color}
                >
                  <div
                    class="h-8 w-8 rounded-full"
                    style={`background: ${result.color}`}
                  />
                </NodeWrap>
                <div>→</div>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center">
                  {#if result.result === "WHERE SKIP"}
                    <div class="text-red-500">✗</div>
                    <NodeWrap
                      props={{ ...props }}
                      path={null}
                      options={null}
                      classes=""
                      comment="This color or combination of colors was removed by a where clause. This means it is not relevant to the quantifier, see explanation below."
                    >
                      {"removed by where clause"}
                    </NodeWrap>
                  {:else}
                    {#each result.evals as evaluation, idx}
                      <DispatchNode
                        props={{
                          ...props,
                          node: evaluation,
                          inducedVariables: {
                            ...props.inducedVariables,
                            ...evaluation.inducedVariables,
                          },
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
