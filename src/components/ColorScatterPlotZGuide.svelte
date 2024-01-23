<script lang="ts">
  import { colorPickerConfig } from "../lib/Color";
  export let xScale: any;
  export let yScale: any;
  export let zScale: any;
  export let textColor: string;
  export let colorSpace: string;
  export let axisColor: string;
  export let margin: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  export let plotWidth: number;
  export let plotHeight: number;
  export let dragging: boolean;

  // dummy variable to clear some warnings
  let dumbVar = xScale || yScale || plotHeight || plotWidth || dragging;
  $: dumbVar = !dumbVar;
  $: config = colorPickerConfig[colorSpace];

  $: zPoints = {
    top: {
      y: zScale.range()[0] + 15,
      label: `${config.zChannel.toUpperCase()}: ${zScale
        .domain()[0]
        .toFixed(1)}`,
    },
    bottom: {
      y: zScale.range()[1] + 30,
      label: zScale.domain()[1].toFixed(1),
    },
  };
</script>

<line
  x1={10}
  y1={margin.top}
  x2={10}
  y2={plotHeight + margin.top}
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
