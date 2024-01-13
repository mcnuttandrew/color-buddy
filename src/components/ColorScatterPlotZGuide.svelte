<script lang="ts">
  //   import colorStore from "../stores/color-store";
  import { colorPickerConfig } from "../lib/Color";
  export let yScale: any;
  export let zScale: any;
  export let textColor: string;
  export let colorSpace: string;
  export let axisColor: string;

  $: config = colorPickerConfig[colorSpace];

  $: zPoints = {
    top: {
      y: zScale.range()[0] + 0,
      label: `${config.zChannel.toUpperCase()}: ${zScale
        .domain()[0]
        .toFixed(1)}`,
    },
    bottom: {
      y: zScale.range()[1] + 15,
      label: zScale.domain()[1].toFixed(1),
    },
  };
  $: plotHeight = yScale.range()[1];
</script>

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
