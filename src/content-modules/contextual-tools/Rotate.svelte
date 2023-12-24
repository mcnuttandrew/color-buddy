<script lang="ts">
  import { toColorSpace, colorFromChannels, Color } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { avgColors } from "../../lib/utils";
  import { buttonStyle } from "../../lib/styles";

  let isOpen = false;
  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
  $: angle = 0;

  $: colorSpace = $colorStore.currentPal.colors[0].spaceName;
  $: angle, rotatePoints();
  let memorizedColors: false | Color[] = false;
  function rotatePoints() {
    if (!isOpen) {
      return;
    }
    if (!memorizedColors) {
      memorizedColors = [...colors];
    }
    let localColors = memorizedColors;
    const center = avgColors(
      focusedColors.map((x) => localColors[x]),
      colorSpace
    );
    const centerChannels = center.toChannels();
    const rotated = Object.fromEntries(
      focusedColors
        .map((x) => localColors[x])
        .map((localColor) => {
          const color = toColorSpace(localColor, colorSpace);
          const channels = color.toChannels();
          //   https://math.stackexchange.com/questions/4354438/how-to-rotate-a-point-on-a-cartesian-plane-around-something-other-than-the-origi
          const x1 = channels[1];
          const y1 = channels[2];
          const xc = centerChannels[1];
          const yc = centerChannels[2];
          const radAngle = (angle / 360) * Math.PI * 2;
          const x3 =
            Math.cos(radAngle) * (x1 - xc) -
            Math.sin(radAngle) * (y1 - yc) +
            xc;
          const y3 =
            Math.sin(radAngle) * (x1 - xc) +
            Math.cos(radAngle) * (y1 - yc) +
            yc;
          return colorFromChannels([channels[0], x3, y3], colorSpace);
        })
        .map((x, y) => [y, x])
    );
    const newColors = localColors.map((x, idx) =>
      focusedColors.includes(idx) ? rotated[focusedColors.indexOf(idx)] : x
    );
    colorStore.setCurrentPalColors(newColors);
  }
</script>

{#if focusedColors.length > 1}
  <Tooltip
    onClose={() => {
      isOpen = false;
      memorizedColors = false;
    }}
  >
    <div slot="content">
      Rotate: {angle}
      <input min={0} max={360} step={1} type="range" bind:value={angle} />
      <span class="text-sm">
        Rotates about an average point of the selected colors.
      </span>
    </div>
    <span slot="target" let:toggle>
      <button
        class={buttonStyle}
        on:click={() => {
          isOpen = true;
          toggle();
        }}
      >
        Rotate
      </button>
    </span>
  </Tooltip>
{/if}
