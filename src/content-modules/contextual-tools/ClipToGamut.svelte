<script lang="ts">
  import colorStore from "../../stores/color-store";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;

  function clipToGamut() {
    const newColors = colors.map((x) => {
      if (x.inGamut()) {
        return x;
      } else {
        const newChannels = x
          .toColorIO()
          .to("srgb")
          .toGamut()
          .to(x.spaceName).coords;
        return x.fromChannels(newChannels);
      }
    });
    colorStore.setCurrentPalColors(newColors);
  }

  $: outOfGamutColors = [...colors].map((x) => x.inGamut());
</script>

{#if outOfGamutColors.length >= 1}
  <button class={buttonStyle} on:click={clipToGamut}>Clip to gamut</button>
{/if}
