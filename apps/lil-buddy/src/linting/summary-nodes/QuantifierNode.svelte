<script lang="ts">
  import { LLTypes, linter, Environment } from "color-buddy-palette-lint";
  import type { Palette, Color } from "color-buddy-palette";
  import { makePalFromString } from "color-buddy-palette";
  import DispatchNode from "./DispatchNode.svelte";
  import { evaluateNode } from "../../lib/small-step-evaluator";

  export let node: any;
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
        node.input.children.map((x: any) => x.constructorString)
      ).colors;
    }

    return [];
  }
  $: nodeResult = evaluateNode(node, inducedVariables, pal);

  function checkWhere(node: any, color: Color, varb: string): boolean {
    if (!node) return true;
    const result = evaluateNode(
      node,
      { ...inducedVariables, [varb]: color },
      pal
    );
    return result.result;
  }
</script>

<div class="flex items-center">
  <div class="flex flex-col">
    <div class="font-bold">{node.type} - {node.varbs}</div>
    <div class="bg-opacity-30 bg-slate-300 flex flex-col p-2">
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
              {#if checkWhere(node.where, color, node.varbs[0])}
                <DispatchNode
                  node={node.predicate.value}
                  {pal}
                  inducedVariables={{
                    ...inducedVariables,
                    [node.varbs[0]]: color,
                  }}
                />
              {:else}
                <div class="text-red-500">✗</div>
                removed by where
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div>→{nodeResult.result}</div>
  <!-- <div>→</div> -->
</div>
