<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { Color, CIELAB } from "../lib/Color";
  import { scaleLinear } from "d3-scale";

  export let width = 256;
  export let height = 256;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);

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
  const yScale = scaleLinear().domain([100, -100]).range([0, plotHeight]);
  // L
  const zScale = scaleLinear().domain([100, 0]).range([0, plotHeight]);

  let dragging: false | { x: number; y: number } = false;
  const eventToColorXY = (
    e: any,
    color: Color,
    originalColor: Color
  ): Color => {
    if (!dragging || dragging.x === undefined || dragging.y === undefined)
      return color;

    const screenPosDelta = {
      x: e.clientX - dragging.x,
      y: e.clientY - dragging.y,
    };
    const [l, a, b] = originalColor.toChannels();
    const newX = xScale.invert(xScale(a) + screenPosDelta.x);
    const newY = yScale.invert(yScale(b) + screenPosDelta.y);

    return CIELAB.fromChannels([l, newX, newY]);
  };

  const eventToColorZ = (e: any, color: Color, originalColor: Color): Color => {
    if (!dragging || dragging.x === undefined || dragging.y === undefined)
      return color;

    const screenPosDelta = e.clientY - dragging.y;
    const [l, a, b] = originalColor.toChannels();
    const newZ = zScale.invert(zScale(l) + screenPosDelta);
    return CIELAB.fromChannels([newZ, a, b]);
  };

  $: bg = $colorStore.currentPal.background;
  $: colors = $colorStore.currentPal.colors;

  function stopDrag() {
    dragging = false;
  }

  let originalColors = [] as Color[];
  const startDrag = (e: any) => {
    dragging = { x: e.clientX, y: e.clientY };
    originalColors = [...colors];
  };
  const dragResponse =
    (func: typeof eventToColorZ | typeof eventToColorZ) => (e: any) => {
      const newColors = colors.map((color: Color, idx: number) =>
        focusSet.has(idx) ? func(e, color, originalColors[idx]) : color
      );

      colorStore.setCurrentPalColors(newColors);
    };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <span>CIELAB a*, b*</span>
  <svg {width} {height} on:mouseleave={stopDrag} on:mouseup={stopDrag}>
    <g transform={`translate(${margin.left}, ${margin.top})`}>
      <rect
        x={0}
        y={0}
        width={xScale.range()[1]}
        height={yScale.range()[1]}
        fill={bg.toHex()}
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
            focusStore.clearColors();
          }
        }}
        on:mousemove={(e) => {
          if (dragging) {
            dragResponse(eventToColorXY)(e);
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

      {#each colors as color, i (color)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <circle
          on:mousedown={(e) => startDrag(e)}
          class="cursor-pointer"
          cx={xScale(color.toChannels()[1])}
          cy={yScale(color.toChannels()[2])}
          r={10 + (focusSet.has(i) ? 5 : 0)}
          fill={color.toHex()}
          on:click={(e) => {
            if (e.metaKey) {
              focusStore.toggleColor(i);
            } else {
              focusStore.setColors([i]);
            }
          }}
        />
      {/each}
      <text
        x={xScale(bg.toChannels()[1])}
        y={yScale(bg.toChannels()[2])}
        fill={bg.toChroma().luminance() > 0.5 ? "black" : "white"}
      >
        BG
      </text>
    </g>
  </svg>
</div>
<div>
  <span>CIELAB L*</span>
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
        fill={bg.toHex()}
        stroke="gray"
        stroke-width="1"
        on:mousemove={(e) => {
          if (dragging) {
            dragResponse(eventToColorZ)(e);
          }
        }}
      />
      {#each $colorStore.currentPal.colors as color, i}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <rect
          x={10 - (focusSet.has(i) ? 5 : 0)}
          class="cursor-pointer"
          y={zScale(color.toChannels()[0])}
          width={80 - 10 * 2 + (focusSet.has(i) ? 10 : 0)}
          height={5}
          fill={color.toHex()}
          on:click={() => {
            focusStore.toggleColor(i);
          }}
          on:mousedown={(e) => startDrag(e)}
        />
      {/each}
    </g>
  </svg>
</div>
