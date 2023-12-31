<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  $: colors = $colorStore.currentPal.colors;
  $: bg = $colorStore.currentPal.background;
  $: focusSet = new Set($focusStore.focusedColors);

  let common = "cursor-pointer mr-2 mb-2 transition-transform";
  let classes = [
    {
      className: `${common} w-14 h-14 `,
      styleMap: (color: Color): string => `background-color: ${color.toHex()}`,
    },
    {
      className: `${common} w-8 h-8`,
      styleMap: (color: Color): string => `background-color: ${color.toHex()}`,
    },
    {
      className: `${common} w-8 h-8 rounded-full`,
      styleMap: (color: Color): string => `border: 4px solid ${color.toHex()}`,
    },
  ];
</script>

<div
  class="flex flex-col p-4 flex-initial"
  style={`background-color: ${bg.toHex()}; max-width: 600px`}
>
  Click to modify colors
  {#each classes as { className, styleMap }, jdx}
    <div class="flex justify-center flex-wrap">
      {#each colors as color, idx}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <Tooltip
          top={"100px"}
          onClose={() => {
            focusStore.clearColors();
          }}
        >
          <div slot="content" class="flex flex-col" let:onClick>
            <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
          </div>
          <div
            let:toggle
            slot="target"
            class={className}
            style={styleMap(color)}
            on:click={() => {
              toggle();

              focusStore.addColor(idx);
            }}
            class:rotate-45={focusSet.has(idx)}
          ></div>
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
