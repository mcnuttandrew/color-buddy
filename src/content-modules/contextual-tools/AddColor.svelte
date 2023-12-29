<script lang="ts">
  import colorStore from "../../stores/color-store";
  import { avgColors, randColor, pick } from "../../lib/utils";
  import { buttonStyle } from "../../lib/styles";
  import { toColorSpace } from "../../lib/Color";

  $: colors = $colorStore.currentPal.colors;
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";
</script>

<div>
  <button
    class={buttonStyle}
    on:click={() => {
      if (colors.length < 2) {
        colorStore.addColorToCurrentPal(randColor());
      } else {
        const randColors = [pick(colors), pick(colors)];
        const newColor = toColorSpace(avgColors(randColors, "lab"), colorSpace);
        colorStore.addColorToCurrentPal(newColor);
      }
    }}
  >
    Add Color
  </button>
</div>
