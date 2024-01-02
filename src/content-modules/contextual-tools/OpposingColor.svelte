<script lang="ts">
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { opposingColor } from "../../lib/utils";
  import Tooltip from "../../components/Tooltip.svelte";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
</script>

{#if focusedColors.length >= 1}
  <Tooltip>
    <div slot="content" class="w-40">
      <button
        class={buttonStyle}
        on:click={() => {
          const newColors = colors.map((color, idx) => {
            return focusSet.has(idx) ? opposingColor(color) : color;
          });
          colorStore.setCurrentPalColors(newColors);
        }}
      >
        Opposing Colors
      </button>
    </div>
    <div slot="target" let:toggle>
      <button class={buttonStyle} on:click={toggle}>Convert to</button>
    </div>
  </Tooltip>
{/if}
