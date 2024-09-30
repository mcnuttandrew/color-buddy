<script lang="ts">
  import { Color } from "color-buddy-palette";

  import { colorPickerConfig } from "../lib/utils";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";

  $: focusedColors = $focusStore.focusedColors;
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal.colorSpace;
  $: config = colorPickerConfig[colorSpace];
  $: isPolar = colorPickerConfig[colorSpace].isPolar;

  $: colors = currentPal.colors;
  $: angle = 0;

  $: angle, colorSpace, rotatePoints();
  $: memorizedColors = false as false | Color[];

  function rotatePoints() {
    if (focusedColors.length === 0) {
      // memorizedColors = false;
      return;
    }
    if (memorizedColors && focusedColors.length !== memorizedColors.length) {
      memorizedColors = [...colors];
    }
    if (!memorizedColors) {
      memorizedColors = [...colors];
      angle = 0;
    }
    let localColors = memorizedColors;

    // always rotate around zero
    let centerChannels = [0, 0, 0];
    const rotated = Object.fromEntries(
      focusedColors
        .map((x) => localColors[x])
        .map((localColor) => {
          const color = Color.toColorSpace(localColor, colorSpace);
          const channels = color.toChannels();
          //   https://math.stackexchange.com/questions/4354438/how-to-rotate-a-point-on-a-cartesian-plane-around-something-other-than-the-origi

          const channelA = config.xChannelIndex;
          const channelB = config.yChannelIndex;

          let x1 = channels[channelA];
          let y1 = channels[channelB];
          let xc = centerChannels[channelA];
          let yc = centerChannels[channelB];

          const radAngle = (angle / 360) * Math.PI * 2;
          const tau = (Math.PI * 2) / 360;
          if (isPolar) {
            let tempX1 = x1 * Math.cos(y1 * tau);
            let tempY1 = x1 * Math.sin(y1 * tau);
            x1 = tempX1;
            y1 = tempY1;

            let tempXc = xc * Math.cos(yc * tau);
            let tempYc = xc * Math.sin(yc * tau);
            xc = tempXc;
            yc = tempYc;
          }
          const x3 =
            Math.cos(radAngle) * (x1 - xc) -
            Math.sin(radAngle) * (y1 - yc) +
            xc;
          const y3 =
            Math.sin(radAngle) * (x1 - xc) +
            Math.cos(radAngle) * (y1 - yc) +
            yc;
          let newChannels = [...channels] as [number, number, number];
          newChannels[config.xChannelIndex] = x3;
          newChannels[config.yChannelIndex] = y3;

          if (isPolar) {
            const x = newChannels[channelA];
            const y = newChannels[channelB];
            let angle = (Math.atan2(y, x) / tau) % 360;
            angle = angle < 0 ? angle + 360 : angle;
            let rad = Math.sqrt(x * x + y * y);
            newChannels[channelA] = rad;
            newChannels[channelB] = angle;
          }

          return Color.colorFromChannels(newChannels, colorSpace);
        })
        .map((x, y) => [y, x])
    );
    const newColors = localColors.map((x, idx) => {
      const newColor = focusedColors.includes(idx)
        ? rotated[focusedColors.indexOf(idx)]
        : x;
      newColor.tags = x.tags;
      return newColor;
    });
    colorStore.setCurrentPalColors(newColors);
  }
</script>

<div class="w-full flex justify-between">
  <div>Rotate:</div>
  <input min={0} max={360} step={1} type="range" bind:value={angle} />
  <input
    min={0}
    max={360}
    step={1}
    type="number"
    bind:value={angle}
    class="w-16 text-sm"
  />
</div>
