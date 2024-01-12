<script lang="ts">
  import colorStore from "../stores/color-store";
  import { colorPickerConfig } from "../lib/Color";
  export let dragging: boolean;
  export let yScale: any;
  export let zScale: any;
  export let textColor: string;
  export let colorSpace: string;
  export let axisColor: string;

  $: bg = $colorStore.currentPal.background;
  $: config = colorPickerConfig[colorSpace];

  $: zPoints = {
    top: {
      y: zScale.range()[0] + 15,
      label: `${config.zChannel.toUpperCase()}: ${zScale
        .domain()[0]
        .toFixed(1)}`,
    },
    bottom: {
      y: zScale.range()[1] - 5,
      label: zScale.domain()[1].toFixed(1),
    },
  };
  $: plotHeight = yScale.range()[1];
</script>

<!-- <rect
  x={0}
  y={0}
  width={80}
  height={plotHeight}
  fill={bg.toHex()}
  stroke="gray"
  stroke-width="1"
  class:cursor-pointer={dragging}
/> -->
<line
  x1={10}
  y1={0}
  x2={10}
  y2={plotHeight}
  stroke={axisColor}
  stroke-width="1"
/>

{#each Object.values(zPoints) as point}
  <text
    pointer-events="none"
    text-anchor={"middle"}
    x={40 + 15}
    y={point.y}
    fill={textColor}
  >
    {point.label}
  </text>
{/each}
