<script lang="ts">
  import colorStore from "../../stores/color-store";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;

  const clamp = (x: number, min: number, max: number) =>
    Math.min(Math.max(x, min), max);

  function clipToGamut() {
    const newColors = colors.map((x) => {
      if (x.inGamut()) {
        const channels = Object.entries(x.domains).map(([key, domain]) => {
          const [min, max] = domain.sort();
          return clamp(x.channels[key], min, max);
        });
        return x.fromChannels(channels as [number, number, number]);

        // return x;
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
