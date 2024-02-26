<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import { Color } from "../lib/Color";

  import AlignSelection from "../controls/AlignSelection.svelte";
  import SuggestionModificationToSelection from "../controls/SuggestionModificationToSelection.svelte";
  import InterpolatePoints from "../controls/InterpolatePoints.svelte";
  import DistributePoints from "../controls/DistributePoints.svelte";
  import AdjustColor from "../controls/AdjustColor.svelte";
  import AddColor from "../controls/AddColor.svelte";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import Rotate from "../controls/Rotate.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorSpace = currentPal.colorSpace;
  $: focusedColors = $focusStore.focusedColors;
</script>

<div class="px-2">
  <AddColor />
  <SuggestionModificationToSelection />
  <AdjustColor />
  {#if focusedColors.length === 1}
    <div class="w-full border-t-2 border-black my-2"></div>
    <input
      class="w-full"
      value={colors[focusedColors[0]].toHex()}
      on:change={(e) => {
        const updatedColors = [...colors];
        updatedColors[focusedColors[0]] = Color.colorFromString(
          e.currentTarget.value,
          colorSpace
        );
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
        updatedColors[focusedColors[0]] = color.toColorSpace(colorSpace);
        colorStore.setCurrentPalColors(updatedColors);
      }}
    />
  {/if}

  <DistributePoints />
  <AlignSelection />
  {#if focusedColors.length > 0}
    <Rotate />
  {/if}

  <InterpolatePoints />
</div>
