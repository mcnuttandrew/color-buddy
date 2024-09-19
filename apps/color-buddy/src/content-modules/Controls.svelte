<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import GetColorsFromString from "../controls/GetColorsFromString.svelte";

  import { Color } from "color-buddy-palette";

  import AdjustColor from "../controls/AdjustColor.svelte";
  import AlignSelection from "../controls/AlignSelection.svelte";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import ColorTagger from "../controls/ColorTagger.svelte";
  import DistributePoints from "../controls/DistributePoints.svelte";
  import InterpolatePoints from "../controls/InterpolatePoints.svelte";
  import Rotate from "../controls/Rotate.svelte";
  import SuggestionModificationToSelection from "../controls/SuggestionModificationToSelection.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorSpace = currentPal.colorSpace;
  $: focusedColors = $focusStore.focusedColors;
</script>

<div class="px-2 w-96 block bg-stone-300">
  {#if focusedColors.length === 1}
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
  {/if}
  <AdjustColor />
  <div class="w-96"></div>

  <DistributePoints />
  <AlignSelection />
  {#if focusedColors.length > 0}
    <Rotate />
  {/if}

  <InterpolatePoints />
</div>
