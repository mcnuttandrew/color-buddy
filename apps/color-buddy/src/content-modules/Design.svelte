<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import { buttonStyle } from "../lib/styles";

  import AdjustColor from "../controls/AdjustColor.svelte";
  import AlignSelection from "../controls/AlignSelection.svelte";
  import DistributePoints from "../controls/DistributePoints.svelte";
  import InterpolatePoints from "../controls/InterpolatePoints.svelte";
  import Rotate from "../controls/Rotate.svelte";

  import ColorChannelWrapper from "../components/ColorChannelWrapper.svelte";
  import ColorTagger from "../controls/ColorTagger.svelte";
  import Background from "../components/Background.svelte";
  import PalTypeConfig from "../controls/PalTypeConfig.svelte";
  import PalTags from "../controls/PalTags.svelte";

  import GetColorsFromString from "../controls/GetColorsFromString.svelte";

  import SetColorSpace from "../controls/SetColorSpace.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  const sectionStyle = "border-b border-stone-300 px-4 py-2";
</script>

{#if $focusStore.focusedColors.length === 0}
  <div class=" {sectionStyle}">
    <div class="font-bold">Palette</div>
    <PalTypeConfig />
    <div class="my-2" />
    <SetColorSpace
      colorSpace={currentPal.colorSpace}
      onChange={(space) => {
        colorStore.setColorSpace(space);
        configStore.unsetZoom();
      }}
    />
    <div class="my-2" />
    <Background
      onSpaceChange={(space) => {
        // @ts-ignore
        configStore.setChannelPickerSpaceBackground(space);
      }}
      onChange={(bg) =>
        colorStore.setBackground(bg.toColorSpace(currentPal.colorSpace))}
      bg={currentPal.background}
      colorSpace={$configStore.channelPickerSpaceBackground}
    />
    <div class="my-2" />
    <PalTags />
  </div>
  <div class={sectionStyle}>
    <div class="font-bold">Contents</div>
    <GetColorsFromString
      onChange={(colors) => colorStore.setCurrentPalColors(colors)}
      colorSpace={currentPal.colorSpace}
      colors={currentPal.colors}
    />
  </div>
{/if}
{#if $focusStore.focusedColors.length === 1}
  <div class={sectionStyle}>
    <div class="font-bold">Adjust</div>
    <AdjustColor />
    <div class="my-2" />
    <div class="max-w-80">
      <Rotate />
    </div>
  </div>
  <div class={sectionStyle}>
    <div class="font-bold">Value</div>
    <div class="max-w-60">
      <ColorChannelWrapper />
    </div>
    <ColorTagger />
  </div>
{/if}
{#if $focusStore.focusedColors.length > 1}
  <div class={sectionStyle}>
    <div class="font-bold">Adjust</div>
    <AdjustColor />
    <div class="my-2" />
    <div class="max-w-80">
      <Rotate />
    </div>
  </div>
  {#if $focusStore.focusedColors.length > 2}
    <div class={sectionStyle}>
      <div class="font-bold">Distribute</div>
      <DistributePoints />
    </div>
  {/if}

  <div class={sectionStyle}>
    <div class="font-bold">Align</div>
    <AlignSelection />
  </div>

  <div class={sectionStyle}>
    <div class="font-bold">Interpolate</div>
    <div class="max-w-80">
      <InterpolatePoints />
    </div>
  </div>
{/if}
