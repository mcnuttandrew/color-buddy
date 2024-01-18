<script lang="ts">
  import { colorPickerConfig, colorFromChannels } from "../lib/Color";
  import { arc } from "d3-shape";

  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { scaleLinear } from "d3-scale";
  export let rScale: any;
  export let yScale: any;
  export let xScale: any;
  export let plotHeight: number;
  export let plotWidth: number;
  export let colorSpace: string;
  export let dragging: boolean;
  export let axisColor: string;
  export let textColor: string;

  $: config = colorPickerConfig[colorSpace as keyof typeof colorPickerConfig];
  //   $: xNonDimScale = scaleLinear().domain([0, 1]).range(xScale.domain());
  //   $: yNonDimScale = scaleLinear().domain([0, 1]).range(yScale.domain());
  $: rNonDimScale = scaleLinear().domain([0, 1]).range(rScale.domain());
  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
  //   $: axisFormatter =
  //     colorPickerConfig[colorSpace as keyof typeof colorPickerConfig].axisLabel;

  //   $: points = {
  //     centerTop: {
  //       x: (xScale.range()[1] - xScale.range()[0]) / 2,
  //       y: yScale.range()[0],
  //       labelAdjust: { x: 0, y: -3 },
  //       anchor: "middle",
  //       label: `${config.yChannel}: ${axisFormatter(yScale.domain()[0])}`,
  //     },
  //     centerBottom: {
  //       x: (xScale.range()[1] - xScale.range()[0]) / 2,
  //       y: yScale.range()[1],
  //       anchor: "middle",
  //       labelAdjust: { x: 0, y: 15 },
  //       label: axisFormatter(yScale.domain()[1]),
  //     },
  //     centerLeft: {
  //       x: xScale.range()[0],
  //       y: (yScale.range()[1] - yScale.range()[0]) / 2,
  //       anchor: "start",
  //       labelAdjust: { x: 5, y: -3 },
  //       label: axisFormatter(xScale.domain()[0]),
  //     },
  //     centerRight: {
  //       x: xScale.range()[1],
  //       y: (yScale.range()[1] - yScale.range()[0]) / 2,
  //       anchor: "end",
  //       labelAdjust: { x: -5, y: -3 },
  //       label: `${config.xChannel}: ${axisFormatter(xScale.domain()[1])}`,
  //     },
  //   };
  $: miniConfig = {
    xIdx: config.xChannelIndex,
    yIdx: config.yChannelIndex,
    zIdx: config.zChannelIndex,
  };
  // $:    { xIdx, yIdx, zIdx } = miniConfig;
  const angleBgResolution = 30;
  const rBgResolution = 5;
  const avgNums = (nums: number[]) =>
    nums.reduce((acc, x) => acc + x, 0) / nums.length;
  $: fillColor = (i: number, j: number) => {
    const { xIdx, yIdx, zIdx } = miniConfig;
    if (true || (dragging && focusedColors.length === 1)) {
      const coords = [0, 0, 0] as [number, number, number];
      const angle = (j / angleBgResolution) * 360;
      const r = rNonDimScale(i / rBgResolution);
      coords[xIdx] = r;
      coords[yIdx] = angle;
      //   const avgZChannel = avgNums(
      //     focusedColors.map((x) => colors[x].toChannels()[zIdx])
      //   );
      const avgZChannel = avgNums(colors.map((x) => x.toChannels()[zIdx]));
      coords[zIdx] = avgZChannel;
      return colorFromChannels(coords, colorSpace as any).toDisplay();
    }
    return "#ffffff00";
  };
  $: arcScale = arc();
  $: angleScale = scaleLinear()
    .domain([0, angleBgResolution])
    .range([0, Math.PI * 2]);
</script>

<g transform="translate({plotWidth / 2}, {plotHeight / 2})">
  {#each [...new Array(rBgResolution)] as _, i}
    {#each [...new Array(angleBgResolution)] as _, j}
      <!-- <rect
      x={xScale(xNonDimScale(i / bgResolution))}
      y={yScale(yNonDimScale(j / bgResolution))}
      width={plotWidth / bgResolution}
      height={plotHeight / bgResolution}
      class="transition-opacity duration-500 ease-in-out"
      fill={fillColor(i, j)}
      stroke={"white"}
    /> -->
      <path
        fill={fillColor(i, j)}
        stroke={"white"}
        d={arcScale({
          startAngle: angleScale(j) + Math.PI / 2,
          endAngle: angleScale(j + 1) + Math.PI / 2,
          innerRadius: rScale(rNonDimScale(i / rBgResolution)),
          outerRadius: rScale(rNonDimScale((i + 1) / rBgResolution)),
        })}
      />
    {/each}
  {/each}
</g>
<!-- opacity={dragging && focusedColors.length === 1 ? 1 : 0} -->
