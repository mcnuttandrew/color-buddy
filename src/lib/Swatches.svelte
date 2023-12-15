<script lang="ts">
  import type { Color } from "chroma-js";
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  import Tooltip from "./Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  $: colors = $colorStore.currentPal.colors;
  $: bg = $colorStore.currentPal.background;
  $: focusSet = new Set($focusStore.focusedColors);

  let common = "cursor-pointer mr-2 mb-2";
  let classes = [
    {
      className: `${common} w-14 h-14 `,
      styleMap: (color: Color): string => `background-color: ${color.hex()}`,
    },
    {
      className: `${common} w-8 h-8`,
      styleMap: (color: Color): string => `background-color: ${color.hex()}`,
    },
    {
      className: `${common} w-8 h-8 rounded-full`,
      styleMap: (color: Color): string => `border: 4px solid ${color.hex()}`,
    },
  ];
</script>

<div class="flex p-2" style={`background-color: ${bg.hex()}`}>
  {#each classes as { className, styleMap }, jdx}
    <div class="flex flex-wrap">
      {#each colors as color, idx}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div>
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
              class:mt-2={focusSet.has(idx)}
              class:ml-2={focusSet.has(idx)}
            ></div>
          </Tooltip>
        </div>
      {/each}
    </div>
  {/each}
  <div class="flex flex-wrap">
    {#each colors as color}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div style={`color: ${color.hex()}`}>
        {color.hex()}
      </div>
    {/each}
  </div>
</div>
