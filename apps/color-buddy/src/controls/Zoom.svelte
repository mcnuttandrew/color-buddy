<script lang="ts">
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import { colorPickerConfig } from "../lib/utils";
  import DoubleRangeSlider from "../components/DoubleRangeSlider.svelte";
  import configStore from "../stores/config-store";
  import colorStore from "../stores/color-store";

  $: xZoom = $configStore.xZoom;
  $: xZoom && configStore.setZoom("x", xZoom);
  $: yZoom = $configStore.yZoom;
  $: yZoom && configStore.setZoom("y", yZoom);
  $: zZoom = $configStore.zZoom;
  $: zZoom && configStore.setZoom("z", zZoom);

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal ? currentPal.colorSpace : "lab";
  $: config = colorPickerConfig[colorSpace as keyof typeof colorPickerConfig];

  $: xName = config.xChannel.toUpperCase();
  $: yName = config.yChannel.toUpperCase();
  $: zName = config.zChannel.toUpperCase();

  $: noZoom =
    xZoom[0] === 0 &&
    xZoom[1] === 1 &&
    yZoom[0] === 0 &&
    yZoom[1] === 1 &&
    zZoom[0] === 0 &&
    zZoom[1] === 1;
</script>

<Tooltip>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    Zoom {#if !noZoom}
      (currently zoomed in)
    {/if}
  </button>
  <div slot="content" class="w-48">
    <div class="font-bold">Zoom levels</div>
    <div class="flex">
      <div class="mr-4">{xName}</div>
      <DoubleRangeSlider bind:start={xZoom[0]} bind:end={xZoom[1]} />
    </div>
    <div class="flex">
      <div class="mr-4">{yName}</div>
      <DoubleRangeSlider bind:start={yZoom[0]} bind:end={yZoom[1]} />
    </div>
    <div class="flex">
      <div class="mr-4">{zName}</div>
      <DoubleRangeSlider bind:start={zZoom[0]} bind:end={zZoom[1]} />
    </div>
    <button
      on:click={() => {
        configStore.setZoom("x", [0, 1]);
        configStore.setZoom("y", [0, 1]);
        configStore.setZoom("z", [0, 1]);
      }}
    >
      Reset
    </button>
  </div>
</Tooltip>
