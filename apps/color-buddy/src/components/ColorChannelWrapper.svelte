<script lang="ts">
  import { Color } from "color-buddy-palette";

  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import ColorChannelPicker from "./ColorChannelPicker.svelte";
  import { buttonStyle } from "../lib/styles";

  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.palettes[$colorStore.currentPal].colors;
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal.colorSpace;
</script>

<ColorChannelPicker
  color={colors[focusedColors[0]].toColorSpace(colorSpace)}
  colorMode={$configStore.channelPickerSpace}
  onSpaceChange={(space) => {
    // @ts-ignore
    configStore.setChannelPickerSpace(space);
  }}
  onColorChange={(color) => {
    const updatedColors = [...colors];
    const tags = [...updatedColors[focusedColors[0]].tags];
    updatedColors[focusedColors[0]] = color.toColorSpace(colorSpace);
    updatedColors[focusedColors[0]].tags = tags;

    colorStore.setCurrentPalColors(updatedColors);
  }}
>
  <div>
    <div class="text-xs">RGB Hex</div>
    <input
      class={buttonStyle}
      value={colors[focusedColors[0]].toHex()}
      on:change={(e) => {
        const updatedColors = [...colors];
        const newColor = Color.colorFromString(
          e.currentTarget.value,
          colorSpace
        );
        const tags = [...updatedColors[focusedColors[0]].tags];
        updatedColors[focusedColors[0]] = newColor;
        updatedColors[focusedColors[0]].tags = tags;

        colorStore.setCurrentPalColors(updatedColors);
      }}
    />
  </div>
</ColorChannelPicker>
