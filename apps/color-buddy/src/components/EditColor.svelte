<script lang="ts">
  import { Color } from "color-buddy-palette";
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import ColorChannelPicker from "./ColorChannelPicker.svelte";
  import Tooltip from "./Tooltip.svelte";
  import ColorTagger from "../controls/ColorTagger.svelte";
  import { buttonStyle } from "../lib/styles";
  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.palettes[$colorStore.currentPal].colors;
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal.colorSpace;
</script>

<Tooltip>
  <div slot="content">
    <input
      class="w-full"
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
    />
    <ColorTagger />
  </div>
  <button slot="target" class={buttonStyle} let:toggle on:click={toggle}>
    Edit Color
  </button>
</Tooltip>
