<script lang="ts">
  import type { LintResult } from "color-buddy-palette-lint";

  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";

  import {
    dealWithFocusEvent,
    splitMessageIntoTextAndColors,
    computeStroke,
  } from "../lib/utils";

  export let lintResult: LintResult;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;

  $: hexes = colors.map((x) => x.toHex().toLowerCase());
  $: hexToColor = new Map(hexes.map((x, i) => [x, colors[i]]));

  function stroke(block: string): string {
    const color = hexToColor.get(block);
    if (!color) {
      return "none";
    }
    return computeStroke(color, -1, new Set([-1]));
  }
</script>

{#if lintResult.kind === "success"}
  <div class="text-sm italic">
    {#each splitMessageIntoTextAndColors(lintResult.message) as block}
      {#if block.type === "text"}
        <span>{block.content}</span>
      {:else}
        <button
          on:click|stopPropagation={(e) => {
            const idx = hexes.indexOf(block.content);
            focusStore.setColors(
              dealWithFocusEvent(e, idx, $focusStore.focusedColors)
            );
          }}
          class="w-3 h-3 ml-1 mr-1 inline-block cursor-pointer relative"
          style={"top: 1.5px;"}
        >
          <svg height={12} width={12}>
            <circle
              r={5.8}
              cx={6}
              cy={6}
              fill={block.content}
              stroke={stroke(block.content)}
            />
          </svg>
        </button>
      {/if}
    {/each}
  </div>
{/if}
