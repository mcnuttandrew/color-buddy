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
      className: `${common} w-8 h-8 `,
      styleMap: (color: Color): string => `background-color: ${color.toHex()};`,
      selectionClass: "rotate-12",
    },
    {
      className: `${common} w-6 h-6`,
      styleMap: (color: Color): string => `background-color: ${color.toHex()};`,
      selectionClass: "rotate-12",
    },
    {
      className: `${common} w-4 h-4 rounded-full`,
      styleMap: (color: Color): string => `border: 2px solid ${color.toHex()};`,
      selectionClass: "relative top-1 left-1",
    },
  ];
</script>

<div
  class="flex flex-col p-4 flex-initial"
  style={`background-color: ${bg.toHex()}; max-width: 600px`}
>
  <div class="flex mb-2 justify-between items-center">
    <!-- <span class="text-sm flex flex-col" class:text-white={bg.luminance() < 0.5}>
      <span>Click to modify colors</span>
      <span>Hold shift to select multiple</span>
    </span> -->
  </div>
  {#each classes as { className, styleMap, selectionClass }}
    <div class="flex justify-center flex-wrap">
      {#each colors as color, idx}
        <Tooltip top={"100px"} allowDrag={true}>
          <div slot="content" class="flex flex-col" let:onClick>
            <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
          </div>
          <button
            let:toggle
            let:tooltipOpen
            slot="target"
            class={`${className} ${focusSet.has(idx) ? selectionClass : ""}`}
            style={`${styleMap(color)}`}
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
          ></button>
        </Tooltip>
      {/each}
    </div>
  {/each}
  <div class="flex flex-wrap justify-center">
    {#each colors as color, i}
      <button
        style={`color: ${color.toHex()}; transform: rotate(${
          focusSet.has(i) ? 10 : 0
        }deg)`}
        class="mr-2"
        on:click={(e) => {
          const isMeta = e.metaKey || e.shiftKey;
          if (isMeta) {
            focusStore.toggleColor(i);
          } else {
            focusStore.setColors(focusSet.has(i) ? [] : [i]);
          }
        }}
      >
        {color.toHex()}
      </button>
    {/each}
  </div>
</div>
