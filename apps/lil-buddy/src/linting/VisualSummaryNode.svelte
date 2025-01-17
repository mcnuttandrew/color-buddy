<script lang="ts">
  import { LLTypes, linter, Environment } from "color-buddy-palette-lint";
  import type { Palette, Color } from "color-buddy-palette";
  import { makePalFromString } from "color-buddy-palette";

  type LLNode = InstanceType<(typeof LLTypes)["LLNode"]>;
  export let node: LLNode;
  export let pal: Palette;
  export let inducedVariables: Record<string, Color> = {};

  $: drilledChild = drillThroughExpressionNode(node?.predicate);
  $: isQuantifierAndChildIsQuantifier =
    node.nodeType === "quantifier" && drilledChild?.nodeType === "quantifier";

  function drillThroughExpressionNode(innerNode: LLNode) {
    if (innerNode?.nodeType === "expression") {
      return drillThroughExpressionNode(innerNode.value);
    }
    return innerNode;
  }
</script>

<!-- {#if Node} -->

{#if node.nodeType === "conjunction"}
  <svelte:self node={node.children[0].value} {pal} {inducedVariables} />
{:else if node.nodeType === "quantifier"}
  <div>
    <div class="font-bold">{node.type} - {node.varbs}</div>
    <div class="bg-opacity-30 bg-slate-300 flex flex-col">
      <!-- show combinations -->
      {#if node.input.value === "colors"}
        {#each pal.colors as color}
          <div class="flex items-center">
            <div class="flex">
              {#each Object.values(inducedVariables) as innerColor}
                <div
                  class="h-8 w-8 rounded-full"
                  style={`background: ${innerColor.toHex()}`}
                />
              {/each}
              <div
                class="h-8 w-8 rounded-full"
                style={`background: ${color.toHex()}`}
              />
            </div>
            {#if !isQuantifierAndChildIsQuantifier}
              <div>Predicate</div>
            {/if}
            <div>
              <svelte:self
                node={node.predicate.value}
                {pal}
                inducedVariables={{
                  ...inducedVariables,
                  [node.varbs[0]]: color,
                }}
              />
            </div>
          </div>
        {/each}
      {:else if Array.isArray(node.input.children) && typeof node.input.children?.at(0)?.constructorString}
        {#each makePalFromString(node.input.children.map((x) => x.constructorString)).colors as color}
          <div class="flex">
            <div class="flex">
              {#each Object.values(inducedVariables) as innerColor}
                <div
                  class="h-8 w-8 rounded-full"
                  style={`background: ${innerColor.toHex()}`}
                />
              {/each}
              <div
                class="h-8 w-8 rounded-full"
                style={`background: ${color.toHex()}`}
              />
            </div>
            {#if isQuantifierAndChildIsQuantifier}
              <div>Predicate</div>
            {/if}
            <svelte:self
              node={node.predicate.value}
              {pal}
              inducedVariables={{
                ...inducedVariables,
                [node.varbs[0]]: color,
              }}
            />
          </div>
        {/each}
      {/if}
    </div>
  </div>
{:else if node.nodeType === "predicate"}
  <div class="flex">
    <div>→</div>
    <div class="border p-2 border-black flex">
      <svelte:self node={node.left} {pal} {inducedVariables} />
      <div>{node.type}</div>
      <svelte:self node={node.right} {pal} {inducedVariables} />
    </div>
  </div>
{:else if node.nodeType === "number"}
  <div>{node.value}</div>
{:else if node.nodeType === "variable"}
  {#if inducedVariables[node.value]}
    <div
      class="h-8 w-8 rounded-full"
      style={`background: ${inducedVariables[node.value].toHex()}`}
    />
  {:else}
    <div>{node.value}</div>
  {/if}
{:else if node.nodeType === "pairFunction"}
  <div class="flex">
    {node.type}
    <span>{"("}</span>
    <svelte:self node={node.left} {pal} {inducedVariables} />
    <span>{","}</span>
    <svelte:self node={node.right} {pal} {inducedVariables} />
    <span>{")"}</span>
  </div>
{:else if node.type === "color"}
  <div>hi</div>
{/if}
