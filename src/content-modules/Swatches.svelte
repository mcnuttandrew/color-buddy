<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  import { swap } from "../lib/utils";
  import { buttonStyle } from "../lib/styles";
  $: colors = $colorStore.currentPal.colors;
  $: bg = $colorStore.currentPal.background;
  $: focused = $focusStore.focusedColors;
  $: focusSet = new Set(focused);

  let common = "cursor-pointer mr-2 mb-2 transition-all";
  let classes = [
    {
      className: `${common} w-14 h-14 `,
      styleMap: (color: Color): string => `background-color: ${color.toHex()};`,
    },
    {
      className: `${common} w-8 h-8`,
      styleMap: (color: Color): string => `background-color: ${color.toHex()};`,
    },
    {
      className: `${common} w-8 h-8 rounded-full`,
      styleMap: (color: Color): string => `border: 4px solid ${color.toHex()};`,
    },
  ];
</script>

<div
  class="flex flex-col p-4 flex-initial"
  style={`background-color: ${bg.toHex()}; max-width: 600px`}
>
  <div class="flex mb-2 justify-between items-center">
    <span class="text-sm flex flex-col">
      <span>Click to modify colors,</span>
      <span>Hold shift to select multiple</span>
    </span>
    {#if focused.length === 1}
      {#if focused[0] > 0}
        <button
          class="{buttonStyle} mr-2"
          on:click|stopPropagation|preventDefault={() => {
            let idx = focused[0];
            colorStore.setSort(swap(colors, idx, idx - 1));
            focusStore.setColors([idx - 1]);
          }}
        >
          Move forward
        </button>
      {/if}
      {#if focused[0] < colors.length - 1}
        <button
          class="{buttonStyle} mr-2"
          on:click|stopPropagation|preventDefault={() => {
            let idx = focused[0];
            colorStore.setSort(swap(colors, idx, idx + 1));
            focusStore.setColors([idx + 1]);
          }}
        >
          Move backward
        </button>
      {/if}
    {/if}
    {#if focused.length > 0}
      <button
        class={buttonStyle}
        on:click={() => {
          focusStore.clearColors();
        }}
      >
        Clear Selection
      </button>
    {/if}
  </div>
  {#each classes as { className, styleMap }, jdx}
    <div class="flex justify-center flex-wrap">
      {#each colors as color, idx}
        <Tooltip top={"100px"}>
          <div slot="content" class="flex flex-col" let:onClick>
            <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
          </div>
          <button
            let:toggle
            let:tooltipOpen
            slot="target"
            class={className}
            style={styleMap(color)}
            on:click={(e) => {
              const isFocused = focusSet.has(idx);
              const shiftKey = e.shiftKey;
              if (!tooltipOpen && !isFocused) {
                if (shiftKey) {
                  focusStore.addColor(idx);
                } else {
                  focusStore.setColors([idx]);
                }
                toggle();
              } else if (!tooltipOpen && isFocused) {
                if (shiftKey) {
                  focusStore.toggleColor(idx);
                } else {
                  focusStore.clearColors();
                }
              } else if (tooltipOpen && !isFocused) {
                console.log("C");
                if (shiftKey) {
                  focusStore.addColor(idx);
                } else {
                  focusStore.setColors([idx]);
                }
              } else {
                toggle();
                if (shiftKey) {
                  focusStore.toggleColor(idx);
                } else {
                  focusStore.clearColors();
                }
              }
            }}
            class:rotate-45={focusSet.has(idx)}
          ></button>
        </Tooltip>
      {/each}
    </div>
  {/each}
  <div class="flex flex-wrap justify-center">
    {#each colors as color}
      <div style={`color: ${color.toHex()}`} class="mr-2">
        {color.toHex()}
      </div>
    {/each}
  </div>
</div>
