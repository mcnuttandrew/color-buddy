<script lang="ts">
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { opposingColor } from "../../lib/utils";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
</script>

{#if focusedColors.length === 1}
  <div>
    <button
      class={buttonStyle}
      on:click={() => {
        const newColor = opposingColor(colors[focusedColors[0]]);
        const newColors = [...colors];
        newColors[focusedColors[0]] = newColor;
        colorStore.setCurrentPalColors(newColors);
      }}
    >
      Opposing Color
    </button>
  </div>
{/if}
