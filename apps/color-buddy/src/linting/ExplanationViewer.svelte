<script lang="ts">
  import type { LintResult } from "@color-buddy/palette-lint";

  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";

  import {
    dealWithFocusEvent,
    splitMessageIntoTextAndColors,
  } from "../lib/utils";

  export let check: LintResult;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
</script>

<div class="text-sm italic">
  {#each splitMessageIntoTextAndColors(check.message) as block}
    {#if block.type === "text"}
      <span>{block.content}</span>
    {:else}
      <button
        on:click|stopPropagation={(e) => {
          const hexes = colors.map((x) => x.color.toHex().toLowerCase());
          const idx = hexes.findIndex((x) => x === block.content.toLowerCase());
          focusStore.setColors(
            dealWithFocusEvent(e, idx, $focusStore.focusedColors)
          );
        }}
        style={`background-color: ${block.content}; top: -3px`}
        class="rounded-full w-3 h-3 ml-1 mr-1 inline-block cursor-pointer relative"
      ></button>
    {/if}
  {/each}
</div>

<!-- on:click={() => {
          const hexes = colors.map((x) => x.toHex().toLowerCase());
          const idx = hexes.findIndex((x) => x === block.content.toLowerCase());
          if (idx === -1) return;
          focusStore.setColors([idx]);
        }} -->
