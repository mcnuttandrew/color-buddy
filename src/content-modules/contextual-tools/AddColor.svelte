<script lang="ts">
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { avgColors } from "../../lib/utils";
  import { buttonStyle } from "../../lib/styles";

  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
</script>

<div>
  <button
    class={buttonStyle}
    on:click={() => colorStore.addColorToCurrentPal(avgColors(colors, "lab"))}
  >
    Add Color
  </button>
</div>
