<script lang="ts">
  import { ColorLint } from "../lib/lints/ColorLint";
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  export let check: ColorLint<any, any>;
  type ParseBlock = { content: string; type: "text" | "color" };
  function splitMessageIntoTextAndColors(message: string): ParseBlock[] {
    const output = [] as ParseBlock[];
    let currentTextBlock = "";
    let idx = 0;
    while (idx < message.length) {
      if (message[idx] === "#") {
        if (currentTextBlock.length > 0) {
          output.push({ content: currentTextBlock, type: "text" });
          currentTextBlock = "";
        }
        let color = message.slice(idx, idx + 7);
        output.push({ content: color, type: "color" });
        idx += 6;
      } else {
        currentTextBlock += message[idx];
      }
      idx++;
    }
    if (currentTextBlock.length > 0) {
      output.push({ content: currentTextBlock, type: "text" });
    }

    return output;
  }

  $: colors = $colorStore.currentPal.colors;
</script>

<div class="text-sm italic">
  {#each splitMessageIntoTextAndColors(check.message) as block}
    {#if block.type === "text"}
      <span>{block.content}</span>
    {:else}
      <button
        on:click={() => {
          const hexes = colors.map((x) => x.toHex().toLowerCase());
          const idx = hexes.findIndex((x) => x === block.content.toLowerCase());
          if (idx === -1) return;
          focusStore.setColors([idx]);
        }}
        style={`background-color: ${block.content}; top: -3px`}
        class="rounded-full w-3 h-3 ml-1 mr-1 inline-block cursor-pointer relative"
      ></button>
    {/if}
  {/each}
</div>
