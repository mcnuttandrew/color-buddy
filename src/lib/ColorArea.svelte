<script lang="ts">
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  import chroma from "chroma-js";
  import { scaleLinear } from "d3-scale";

  export let width = 256;
  export let height = 256;
  $: focusedColor = $focusStore.focusedColor;

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xScale = scaleLinear().domain([0, 360]).range([0, plotWidth]);
  const yScale = scaleLinear().domain([0, 1]).range([0, plotHeight]);
  const angles = [...new Array(360)].map((_x, i) => i);

  let dragging: false | number = false;
  const eventToColor = (e: any) => {
    const parentX = e?.target?.getBoundingClientRect().x;
    const parentY = e?.target?.getBoundingClientRect().y;
    const newColor = chroma(
      `hsl(${xScale.invert(e.clientX - parentX)},${
        yScale.invert(e.clientY - parentY) * 100
      }%, 50%)`
    ).hex();
    return newColor;
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  on:mouseleave={() => {
    dragging = false;
  }}
  on:mouseup={() => {
    dragging = false;
  }}
>
  <defs>
    <linearGradient id="rainbow" gradientTransform="rotate(0)">
      {#each angles as angle}
        <stop
          offset={(angle / angles.length) * 100 + "%"}
          stop-color={chroma(`hsl(${angle}, 100%, 50%)`).hex()}
          stop-opacity="1"
        />
      {/each}
    </linearGradient>
    <linearGradient id="chroma" gradientTransform="rotate(90)">
      <stop offset="0" stop-color={"#ffffff"} />
      <stop offset="100%" stop-color={"#000000"} />
    </linearGradient>
  </defs>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <rect x="0" y="0" {width} {height} fill="url('#rainbow')" />
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <rect
      class="cursor-pointer"
      on:click={(e) => {
        if (dragging) {
          dragging = false;
        } else {
          colorStore.setCurrentPal([
            ...$colorStore.currentPal,
            eventToColor(e),
          ]);
        }
      }}
      on:mousemove={(e) => {
        if (dragging) {
          const newColors = [
            ...$colorStore.currentPal.slice(0, dragging),
            eventToColor(e),
            ...$colorStore.currentPal.slice(dragging + 1),
          ];
          colorStore.setCurrentPal(newColors);
        }
      }}
      on:mouseup={() => {
        dragging = false;
      }}
      x="0"
      y="0"
      {width}
      {height}
      fill="url('#chroma')"
      style="mix-blend-mode: screen"
    />
    {#each $colorStore.currentPal as color, i}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <circle
        on:mouseenter={() => {
          focusStore.setFocusedColor(color);
        }}
        on:mouseleave={() => {
          focusStore.setFocusedColor(null);
        }}
        on:mousedown={(e) => {
          dragging = i;
        }}
        class="cursor-pointer"
        cx={xScale(chroma(color).hsl()[0])}
        cy={yScale(chroma(color).hsl()[1])}
        stroke={focusedColor === color ? "black" : "white"}
        stroke-width={focusedColor === color ? "2" : "1"}
        r="10"
        fill={color}
        style="mix-blend-mode: multiply"
      />
    {/each}
  </g>
</svg>
