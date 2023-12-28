<script lang="ts">
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { opposingColor } from "../../lib/utils";
  import Tooltip from "../../components/Tooltip.svelte";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
</script>

{#if focusedColors.length >= 1}
  <Tooltip>
    <div slot="content" class="w-40">
      <button
        class={buttonStyle}
        on:click={() => {
          const newColor = opposingColor(colors[focusedColors[0]]);
          const newColors = [...colors];
          newColors[focusedColors[0]] = newColor;
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
