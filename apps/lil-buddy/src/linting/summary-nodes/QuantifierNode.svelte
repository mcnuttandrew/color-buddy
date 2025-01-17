<script lang="ts">
  import { LLTypes, linter, Environment } from "color-buddy-palette-lint";
  import type { Palette, Color } from "color-buddy-palette";
  import { makePalFromString } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  import { evaluateNode } from "../../lib/small-step-evaluator";

  type LLNode = InstanceType<(typeof LLTypes)["LLNode"]>;
  export let node: LLNode;
  export let pal: Palette;
  export let inducedVariables: Record<string, Color> = {};

  $: values = getValues(node);
  function getValues(node: any) {
    if (node?.input?.value === "colors") {
      return pal.colors;
    }
    if (
      Array.isArray(node?.input?.children) &&
      typeof node.input.children?.at(0)?.constructorString
    ) {
      return makePalFromString(
        node.input.children.map((x) => x.constructorString)
      ).colors;
    }

    return [];
  }
  $: nodeResult = evaluateNode(node, inducedVariables, pal);
</script>

<!-- {#if Node} -->

<div class="flex items-center">
  <div>
    <div class="font-bold">{node.type} - {node.varbs}</div>
    <div class="bg-opacity-30 bg-slate-300 flex flex-col p-2">
      <!-- show combinations -->
      {#each values as color}
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
          <div class="flex flex-col">
            <div class="flex">
              <DispatchNode
                node={node.predicate.value}
                {pal}
                inducedVariables={{
                  ...inducedVariables,
                  [node.varbs[0]]: color,
                }}
              />
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div>→{nodeResult.result}</div>
</div>
<!-- {:else if Array.isArray(node.input.children) && typeof node.input.children?.at(0)?.constructorString}
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
  {/if} -->
