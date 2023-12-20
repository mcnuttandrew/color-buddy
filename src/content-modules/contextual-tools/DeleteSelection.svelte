<script lang="ts">
  import focusStore from "../../stores/focus-store";
  import colorStore from "../../stores/color-store";
  import { buttonStyle } from "../../lib/styles";
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: colors = $colorStore.currentPal.colors;
</script>

{#if focusedColors.length > 0}
  <div>
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalColors(
          colors.filter((_, idx) => !focusSet.has(idx))
        );
        focusStore.clearColors();
      }}
    >
      Delete Selection
    </button>
  </div>
{/if}
