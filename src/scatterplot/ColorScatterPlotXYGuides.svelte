<script lang="ts">
  import { colorPickerConfig, Color } from "../lib/Color";
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { scaleLinear } from "d3-scale";
  export let xScale: any;
  export let yScale: any;
  export let plotHeight: number;
  export let plotWidth: number;
  export let colorSpace: string;
  export let dragging: boolean;
  export let axisColor: string;
  export let textColor: string;

  $: config = colorPickerConfig[colorSpace as keyof typeof colorPickerConfig];
  $: xNonDimScale = scaleLinear().domain([0, 1]).range(xScale.domain());
  $: yNonDimScale = scaleLinear().domain([0, 1]).range(yScale.domain());
  $: focusedColors = $focusStore.focusedColors;
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: axisFormatter =
    colorPickerConfig[colorSpace as keyof typeof colorPickerConfig].axisLabel;

  $: points = {
    centerTop: {
      x: (xScale.range()[1] - xScale.range()[0]) / 2,
      y: yScale.range()[0],
      labelAdjust: { x: 0, y: -3 },
      anchor: "middle",
      label: `${config.yChannel}: ${axisFormatter(yScale.domain()[0])}`,
    },
    centerBottom: {
      x: (xScale.range()[1] - xScale.range()[0]) / 2,
      y: yScale.range()[1],
      anchor: "middle",
      labelAdjust: { x: 0, y: 15 },
      label: axisFormatter(yScale.domain()[1]),
    },
    centerLeft: {
      x: xScale.range()[0],
      y: (yScale.range()[1] - yScale.range()[0]) / 2,
      anchor: "start",
      labelAdjust: { x: 5, y: -3 },
      label: axisFormatter(xScale.domain()[0]),
    },
    centerRight: {
      x: xScale.range()[1],
      y: (yScale.range()[1] - yScale.range()[0]) / 2,
      anchor: "end",
      labelAdjust: { x: -5, y: -3 },
      label: `${config.xChannel}: ${axisFormatter(xScale.domain()[1])}`,
    },
  };
  const bgResolution = 15;
  const avgNums = (nums: number[]) =>
    nums.reduce((acc, x) => acc + x, 0) / nums.length;
  $: fColors = focusedColors.map((x) => colors[x].color.toChannels());
  $: fillColor = (i: number, j: number) => {
    const coords = [0, 0, 0] as [number, number, number];
    coords[config.xChannelIndex] = xNonDimScale(i / bgResolution);
    coords[config.yChannelIndex] = yNonDimScale(j / bgResolution);
    const avgZChannel = avgNums(fColors.map((x) => x[config.zChannelIndex]));
    coords[config.zChannelIndex] = avgZChannel;
    return Color.colorFromChannels(coords, colorSpace as any).toDisplay();
  };
</script>

<!-- colorful background select -->
{#if $configStore.showColorBackground}
  {#each [...new Array(bgResolution)] as _, i}
    {#each [...new Array(bgResolution)] as _, j}
      <rect
        x={xScale(xNonDimScale(i / bgResolution))}
        y={yScale(yNonDimScale(j / bgResolution))}
        width={plotWidth / bgResolution}
        height={plotHeight / bgResolution}
        opacity={dragging && focusedColors.length === 1 ? 1 : 0}
        class="transition-opacity duration-500 ease-in-out"
        fill={fillColor(i, j)}
      />
    {/each}
  {/each}
{/if}

<line
  x1={points.centerTop.x}
  y1={points.centerTop.y}
  x2={points.centerBottom.x}
  y2={points.centerBottom.y}
  stroke={axisColor}
  stroke-width="1"
/>
<line
  x1={points.centerLeft.x}
  y1={points.centerLeft.y}
  x2={points.centerRight.x}
  y2={points.centerRight.y}
  stroke={axisColor}
  stroke-width="1"
/>
{#each Object.values(points) as point}
  <text
    text-anchor={point.anchor}
    x={point.x + point.labelAdjust.x}
    y={point.y + point.labelAdjust.y}
    fill={textColor}
  >
    {point.label}
  </text>
{/each}
