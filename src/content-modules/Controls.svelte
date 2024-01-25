<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import ModifySelection from "../controls/ModifySelection.svelte";
  import AlignSelection from "../controls/AlignSelection.svelte";
  import SuggestionModificationToSelection from "../controls/SuggestionModificationToSelection.svelte";
  import InterpolatePoints from "../controls/InterpolatePoints.svelte";
  import DistributePoints from "../controls/DistributePoints.svelte";
  import AdjustColor from "../controls/AdjustColor.svelte";
  import AddColor from "../controls/AddColor.svelte";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorSpace = currentPal.colorSpace;
  $: focusedColors = $focusStore.focusedColors;
</script>

{#if focusedColors.length === 1}
  <div class="w-full border-t-2 border-black my-2"></div>
  <ColorChannelPicker
    color={colors[focusedColors[0]].toColorSpace(colorSpace)}
    colorMode={colorSpace}
    onColorChange={(color) => {
      const updatedColors = [...colors];
      updatedColors[focusedColors[0]] = color.toColorSpace(colorSpace);
      colorStore.setCurrentPalColors(updatedColors);
    }}
  />
{/if}

<AdjustColor />
<DistributePoints />
<AlignSelection />
<ModifySelection />
<AddColor />
<SuggestionModificationToSelection />
<InterpolatePoints />
