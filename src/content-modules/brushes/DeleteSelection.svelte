<script lang="ts">
  import focusStore from "../../stores/focus-store";
  import colorStore from "../../stores/color-store";
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: colors = $colorStore.currentPal.colors;
</script>

{#if focusedColors.length > 0}
  <div>
    <button
      class="underline mr-2"
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
