<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import Tooltip from "../components/Tooltip.svelte";
  import AdjustColor from "./AdjustColor.svelte";
  import AlignSelection from "./AlignSelection.svelte";
  import DistributePoints from "./DistributePoints.svelte";
  import Rotate from "./Rotate.svelte";
  import ColorTagger from "./ColorTagger.svelte";
  import ColorChannelWrapper from "../components/ColorChannelWrapper.svelte";
  import GetColorsFromString from "./GetColorsFromString.svelte";

  import InterpolatePoints from "./InterpolatePoints.svelte";
  import SuggestionModificationToSelection from "./SuggestionModificationToSelection.svelte";
  import DupAndDelete from "./DupAndDelete.svelte";
  import { buttonStyle } from "../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];

  $: numFocused = $focusStore.focusedColors.length;
  const breaker = "w-full border-b border-stone-200 my-3";
</script>

<div
  class="bg-stone-100 py-2 px-4 border-t border-stone-200 flex flex-col w-full h-full pt-3 overflow-y-auto pb-20"
  id="adjust-controls"
  style={`max-height: calc(100% - (450px + 65px + 48px + 20px))`}
>
  <div class="flex w-full flex-wrap">
    {#if $configStore.engine !== "none"}
      <SuggestionModificationToSelection />
    {/if}
    {#if numFocused > 0}
      <DupAndDelete />
    {/if}
  </div>
  {#if !($configStore.engine === "none" && numFocused === 0)}
    <div class={breaker} />
  {/if}
  {#if numFocused >= 1}
    <!-- <div class="font-bold">Adjust</div> -->
    <AdjustColor />
    <div class="max-w-80 my-1">
      <Rotate />
    </div>
    {#if numFocused > 2}
      <div class={breaker} />
      <div class="font-bold mt-1">Distribute</div>
      <DistributePoints />
    {/if}
    {#if numFocused >= 2}
      <div class={breaker} />
      <div class="font-bold mt-1">Align</div>
      <AlignSelection />
    {/if}
  {/if}
  {#if numFocused === 1}
    <div class={breaker} />
    <ColorChannelWrapper />
    <ColorTagger />
  {/if}

  {#if numFocused >= 2}
    <div class={breaker} />
    <InterpolatePoints />
  {/if}
  {#if numFocused === 0}
    <GetColorsFromString
      onChange={(colors) => colorStore.setCurrentPalColors(colors)}
      colorSpace={currentPal.colorSpace}
      colors={currentPal.colors}
    />
  {/if}
</div>
