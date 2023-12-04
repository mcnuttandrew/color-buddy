<script lang="ts">
  import { scaleLinear } from "d3-scale";
  import chroma from "chroma-js";
  export let colors: string[] = [];
  export let setColors: (colors: string[]) => void = () => {};
  export let width = 256;
  export let height = 256;
  const xScale = scaleLinear().domain([0, 1]).range([0, width]);
  const yScale = scaleLinear().domain([0, 1]).range([0, height]);
  const colorToAngle = (color: string) => {
    const hsl = chroma(color).hsl();
    return ((hsl[0] || 0) / 360) * Math.PI * 2;
  };
  const colorToRadius = (color: string) => {
    const hsl = chroma(color).hsl();
    return ((hsl[1] || 0) * height) / 2;
  };

  let dragging: false | number = false;
</script>

<div>
  <svg {height} {width} class="z-10 absolute">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <rect
      {height}
      {width}
      fill="white"
      opacity="0"
      on:click={(e) => {
        const newColor = chroma(
          `hsl(${xScale.invert(e.clientX)},${
            yScale.invert(e.clientY) * 100
          }%, 50%)`
        ).hex();
        setColors([...colors, newColor]);
      }}
      on:mousemove={(e) => {
        if (dragging) {
          const newColor = chroma(
            `hsl(${xScale.invert(e.clientX)},${
              yScale.invert(e.clientY) * 100
            }%, 50%)`
          ).hex();
          const newColors = [
            ...colors.slice(0, dragging),
            newColor,
            ...colors.slice(dragging + 1),
          ];
          setColors(newColors);
        }
      }}
      on:mouseup={() => {
        dragging = false;
      }}
    />
    <g transform={`translate(${width / 2}, ${height / 2})`}>
      {#each colors as color, i}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <circle
          class="cursor-pointer"
          r="5"
          fill={color}
          cx={colorToRadius(color) * Math.cos(colorToAngle(color))}
          cy={colorToRadius(color) * Math.sin(colorToAngle(color))}
          on:mousedown={(e) => {
            dragging = i;
          }}
        />
      {/each}
    </g>
  </svg>
  <img
    src="public/circle-grad.png"
    style={`height: ${height}px;width:${width}px`}
  />
</div>
