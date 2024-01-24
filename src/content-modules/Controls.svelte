<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import ModifySelection from "./contextual-tools/ModifySelection.svelte";
  import AlignSelection from "./contextual-tools/AlignSelection.svelte";
  import SuggestionModificationToSelection from "./contextual-tools/SuggestionModificationToSelection.svelte";
  import InterpolatePoints from "./contextual-tools/InterpolatePoints.svelte";
  import DistributePoints from "./contextual-tools/DistributePoints.svelte";
  import AdjustColor from "./contextual-tools/AdjustColor.svelte";
  import AddColor from "./contextual-tools/AddColor.svelte";
  import Rotate from "./contextual-tools/Rotate.svelte";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";

  $: colors = $colorStore.currentPal.colors;
  $: colorSpace = $colorStore.currentPal.colorSpace;
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
<Rotate />
<DistributePoints />
<AlignSelection />
<ModifySelection />
<AddColor />
<SuggestionModificationToSelection />
<InterpolatePoints />
