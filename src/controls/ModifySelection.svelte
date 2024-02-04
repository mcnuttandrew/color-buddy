<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import { buttonStyle } from "../lib/styles";
  $: focusedColors = $focusStore.focusedColors;
  $: focusedSet = new Set(focusedColors);
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;

  $: buttonsActive = focusedColors.length > 0;
</script>

<div>
  <button
    class={buttonStyle}
    class:button-deactivated={!buttonsActive}
    on:click={() => {
      colorStore.setCurrentPalColors(
        colors.filter((_, idx) => !focusedSet.has(idx))
      );
      focusStore.clearColors();
    }}
  >
    Delete
  </button>
  <button
    class={buttonStyle}
    class:button-deactivated={!buttonsActive}
    on:click={() => focusStore.clearColors()}
  >
    Deselect
  </button>
  <button
    class={buttonStyle}
    class:button-deactivated={!buttonsActive}
    on:click={() =>
      colorStore.setCurrentPalColors([
        ...currentPal.colors,
        ...currentPal.colors.filter((_, idx) => focusedSet.has(idx)),
      ])}
  >
    Duplicate
  </button>
</div>

<style>
  .button-deactivated {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
