<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  import { colorPickerConfig } from "../../lib/Color";
  import DoubleRangeSlider from "../../components/DoubleRangeSlider.svelte";
  import navStore from "../../stores/nav-store";
  import colorStore from "../../stores/color-store";

  $: xZoom = $navStore.xZoom;
  $: xZoom && navStore.setZoom("x", xZoom);
  $: yZoom = $navStore.yZoom;
  $: yZoom && navStore.setZoom("y", yZoom);
  $: zZoom = $navStore.zZoom;
  $: zZoom && navStore.setZoom("z", zZoom);

  $: colorSpace = $colorStore.currentPal.colorSpace;
  $: config = colorPickerConfig[colorSpace as keyof typeof colorPickerConfig];

  $: xName = config.xChannel.toUpperCase();
  $: yName = config.yChannel.toUpperCase();
  $: zName = config.zChannel.toUpperCase();
</script>

<Tooltip>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    Zoom
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
        navStore.setZoom("x", [0, 1]);
        navStore.setZoom("y", [0, 1]);
        navStore.setZoom("z", [0, 1]);
      }}
    >
      Reset
    </button>
  </div>
</Tooltip>
