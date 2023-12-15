<script lang="ts">
  import { flip } from "svelte/animate";
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  import chroma from "chroma-js";
  import type { Color } from "chroma-js";
  import { scaleLinear } from "d3-scale";
  import { replaceVal, toLab } from "../utils";

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
  // A
  const xScale = scaleLinear().domain([-100, 100]).range([0, plotWidth]);
  // B
  const yScale = scaleLinear().domain([-100, 100]).range([0, plotHeight]);
  // L
  const zScale = scaleLinear().domain([0, 100]).range([0, plotHeight]);

  let dragging: false | number = false;
  const getXY = (e: any) => {
    const parentX = e?.target?.getBoundingClientRect().x;
    const parentY = e?.target?.getBoundingClientRect().y;
    return { parentX, parentY };
  };
  const eventToColorXY = (e: any, target: Color | false): Color => {
    const oldColor = target ? chroma(target).lab() : [50, 0, 0];
    const { parentX, parentY } = getXY(e);
    return chroma.lab(
      oldColor[0],
      xScale.invert(e.clientX - parentX),
      yScale.invert(e.clientY - parentY)
    );
  };

  const eventToColorZ = (e: any, target: Color | false): Color => {
    const oldColor = target ? chroma(target).lab() : [50, 0, 0];
    const { parentY } = getXY(e);
    return chroma.lab(
      zScale.invert(e.clientY - parentY),
      oldColor[1],
      oldColor[2]
    );
  };

  $: bg = $colorStore.currentPal.background;

  function stopDrag() {
    dragging = false;
  }

  const startDrag = (target: number) => () => {
    dragging = target;
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  on:mouseleave={stopDrag}
  on:mouseup={stopDrag}
>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <rect
      x={0}
      y={0}
      width={xScale.range()[1]}
      height={yScale.range()[1]}
      fill="white"
      stroke="gray"
      stroke-width="1"
    />
    <line
      x1={xScale(0)}
      x2={xScale(0)}
      y1={yScale(-100)}
      y2={yScale(100)}
      stroke="gray"
      stroke-width="1"
    />
    <line
      x1={xScale(-100)}
      x2={xScale(100)}
      y1={yScale(0)}
      y2={yScale(0)}
      stroke="gray"
      stroke-width="1"
    />
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <rect
      class="cursor-pointer"
      on:click={(e) => {
        if (dragging) {
          dragging = false;
        } else {
          colorStore.addColorToCurrentPal(eventToColorXY(e, false));
        }
      }}
      on:mousemove={(e) => {
        if (dragging) {
          const colors = $colorStore.currentPal.colors;
          const newColors = replaceVal(
            colors,
            eventToColorXY(e, colors[dragging]),
            dragging
          );
          colorStore.setCurrentPalColors(newColors);
        }
      }}
      on:mouseup={() => {
        dragging = false;
      }}
      x="0"
      y="0"
      {width}
      {height}
      opacity="0"
      fill="white"
    />

    {#each $colorStore.currentPal.colors as color, i (color)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <circle
        animate:flip={{ duration: 200 }}
        on:mouseenter={() => {
          focusStore.setFocusedColor(color);
        }}
        on:mousedown={startDrag(i)}
        class="cursor-pointer"
        cx={xScale(chroma(color).lab()[1])}
        cy={yScale(chroma(color).lab()[2])}
        stroke={focusedColor === color.hex() ? "black" : "white"}
        stroke-width={focusedColor === color.hex() ? "2" : "1"}
        r="10"
        fill={color.hex()}
      />
    {/each}
    <text x={xScale(chroma(bg).lab()[1])} y={yScale(chroma(bg).lab()[2])}>
      BG
    </text>
    <text x={5} y={20}>CIELAB a*, b*</text>
  </g>
</svg>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
  {height}
  width={80 + margin.left + margin.right}
  on:mouseleave={stopDrag}
  on:mouseup={stopDrag}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <rect
      x={0}
      y={0}
      width={80}
      height={yScale.range()[1]}
      fill="white"
      stroke="gray"
      stroke-width="1"
      on:mousemove={(e) => {
        if (dragging) {
          const colors = $colorStore.currentPal.colors;
          const newColors = replaceVal(
            colors,
            eventToColorZ(e, colors[dragging]),
            dragging
          );
          colorStore.setCurrentPalColors(newColors);
        }
      }}
    />
    <text x={5} y={20}>CIELAB L*</text>
    {#each $colorStore.currentPal.colors as color, i}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <rect
        x="10"
        class="cursor-pointer"
        y={zScale(chroma(color).lab()[0])}
        width={80 - 10 * 2}
        height={5}
        fill={color.hex()}
        stroke={focusedColor === color.hex() ? "black" : "white"}
        stroke-width={focusedColor === color.hex() ? "2" : "1"}
        on:mouseenter={() => {
          focusStore.setFocusedColor(color);
        }}
        on:mousedown={startDrag(i)}
      />
    {/each}
  </g>
</svg>
