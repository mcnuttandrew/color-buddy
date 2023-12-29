<script lang="ts">
  import colorStore from "../../stores/color-store";
  import { avgColors, randColor } from "../../lib/utils";
  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
</script>

<div>
  <button
    class={buttonStyle}
    on:click={() => {
      if (colors.length < 2) {
        colorStore.addColorToCurrentPal(randColor());
      } else {
        colorStore.addColorToCurrentPal(avgColors(colors));
      }
    }}
  >
    Add Color
  </button>
</div>
