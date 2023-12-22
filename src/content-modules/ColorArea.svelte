<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { Color, colorFromChannels } from "../lib/Color";
  import { scaleLinear } from "d3-scale";
  import DoubleRangeSlider from "../components/DoubleRangeSlider.svelte";
  import VerticalDoubleRangeSlider from "../components/VerticalDoubleRangeSlider.svelte";

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

  // A: -100 to 100
  let minA = 0;
  let maxA = 1;
  const domainAScale = scaleLinear().domain([0, 1]).range([-100, 100]);
  $: aDomain = [domainAScale(minA), domainAScale(maxA)];
  $: xScale = scaleLinear().domain(aDomain).range([0, plotWidth]);
  // B: -100 to 100
  let minB = 0;
  let maxB = 1;
  const domainBScale = scaleLinear().domain([0, 1]).range([-100, 100]);
  $: bDomain = [domainBScale(minB), domainBScale(maxB)];
  $: yScale = scaleLinear().domain(bDomain).range([0, plotHeight]);

  // L: 0 to 100
  let minL = 0;
  let maxL = 1;
  const domainLScale = scaleLinear().domain([0, 1]).range([0, 100]);
  $: lDomain = [domainLScale(minL), domainLScale(maxL)];
  $: zScale = scaleLinear().domain(lDomain).range([0, plotHeight]);

  let dragging: false | { x: number; y: number } = false;
  let dragBox: false | { x: number; y: number } = false;
  let parentPos = { x: 0, y: 0 };
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
    const clampToBoundary = (val: number) => Math.min(Math.max(val, -100), 100);
    const newX = xScale.invert(xScale(a) + screenPosDelta.x);
    const newY = yScale.invert(yScale(b) + screenPosDelta.y);

    return colorFromChannels(
      [l, clampToBoundary(newX), clampToBoundary(newY)],
      "lab"
    );
  };

  const eventToColorZ = (e: any, color: Color, originalColor: Color): Color => {
    if (!dragging || dragging.x === undefined || dragging.y === undefined)
      return color;

    const screenPosDelta = e.clientY - dragging.y;
    const [l, a, b] = originalColor.toChannels();
    const newZ = zScale.invert(zScale(l) + screenPosDelta);
    const clampToBoundary = (val: number) => Math.min(Math.max(val, 0), 100);
    return colorFromChannels([clampToBoundary(newZ), a, b], "lab");
  };

  $: bg = $colorStore.currentPal.background;
  $: colors = $colorStore.currentPal.colors;

  function stopDrag() {
    dragging = false;
    dragBox = false;
  }

  let originalColors = [] as Color[];
  const startDrag = (e: any) => {
    parentPos = e.target.getBoundingClientRect();
    dragging = { x: e.clientX, y: e.clientY };
    originalColors = [...colors];
    if ($focusStore.focusedColors.length === 0) {
      dragBox = { x: e.clientX, y: e.clientY };
    } else {
      dragBox = false;
    }
  };

  const dragResponse =
    (func: typeof eventToColorZ | typeof eventToColorZ) => (e: any) => {
      const newColors = colors.map((color: Color, idx: number) =>
        focusSet.has(idx) ? func(e, color, originalColors[idx]) : color
      );

      colorStore.setCurrentPalColors(newColors);
    };
  function selectColorsFromDrag(
    dragBox: { x: number; y: number },
    dragging: { x: number; y: number }
  ) {
    const xMin = Math.min(dragging.x, dragBox.x) - parentPos.x;
    const xMax = Math.max(dragging.x, dragBox.x) - parentPos.x;
    const yMin = Math.min(dragging.y, dragBox.y) - parentPos.y;
    const yMax = Math.max(dragging.y, dragBox.y) - parentPos.y;
    const newFocusedColors = colors
      .map((color, idx) => {
        const [_l, a, b] = color.toChannels();
        const [x, y] = [xScale(a), yScale(b)];
        return xMin <= x && x <= xMax && yMin <= y && y <= yMax ? idx : -1;
      })
      .filter((x) => x !== -1);
    focusStore.setColors(newFocusedColors);
  }
  function dragGeneric(e) {
    if (dragging && $focusStore.focusedColors.length > 0) {
      dragResponse(eventToColorXY)(e);
    }
    if (dragging && $focusStore.focusedColors.length === 0) {
      dragBox = { x: e.clientX, y: e.clientY };
    }
  }
  function backgroundEnd(e) {
    if (dragBox && dragging) {
      selectColorsFromDrag(dragBox, dragging);
    }
    if (dragging && dragging.x === e.clientX && dragging.y === e.clientY) {
      focusStore.clearColors();
    }

    dragging = false;
    dragBox = false;
  }
  function dragGenericZ(e) {
    if (dragging) {
      dragResponse(eventToColorZ)(e);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-col">
  <span>CIELAB a*, b*</span>
  <div class="flex h-full">
    <div class="h-full py-4" style="max-height: {height}px">
      <VerticalDoubleRangeSlider bind:start={minB} bind:end={maxB} />
    </div>
    <svg {width} {height} on:mouseleave={stopDrag} on:mouseup={stopDrag}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <rect
          x={0}
          y={0}
          width={xScale.range()[1]}
          height={yScale.range()[1]}
          fill={bg.toHex()}
          stroke={bg.toChroma().luminance() > 0.5 ? "gray" : "white"}
          stroke-width="1"
        />
        <line
          x1={(xScale.range()[1] - xScale.range()[0]) / 2}
          x2={(xScale.range()[1] - xScale.range()[0]) / 2}
          y1={yScale.range()[0]}
          y2={yScale.range()[1]}
          stroke={bg.toChroma().luminance() > 0.5 ? "gray" : "white"}
          stroke-width="1"
        />
        <line
          x1={xScale.range()[0]}
          x2={xScale.range()[1]}
          y1={(yScale.range()[1] - yScale.range()[0]) / 2}
          y2={(yScale.range()[1] - yScale.range()[0]) / 2}
          stroke={bg.toChroma().luminance() > 0.5 ? "gray" : "white"}
          stroke-width="1"
        />
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <rect
          on:mousedown={(e) => startDrag(e)}
          on:touchstart={(e) => startDrag(e)}
          on:mousemove={(e) => dragGeneric(e)}
          on:touchmove={(e) => dragGeneric(e)}
          on:mouseup={(e) => backgroundEnd(e)}
          on:touchend={(e) => backgroundEnd(e)}
          x="0"
          y="0"
          {width}
          {height}
          opacity="0"
          fill="white"
          class:cursor-pointer={dragging}
        />

        {#each colors as color, i (color)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <circle
            on:mousedown={(e) => startDrag(e)}
            on:touchstart={(e) => startDrag(e)}
            class="cursor-pointer transition-all"
            transform={`translate(${xScale(color.toChannels()[1])}, ${yScale(
              color.toChannels()[2]
            )})`}
            r={10 + (focusSet.has(i) ? 5 : 0)}
            fill={color.toHex()}
            on:click={(e) => {
              if (e.metaKey || e.shiftKey) {
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
          text-anchor="middle"
          alignment-baseline="middle"
          class="pointer-events-none"
        >
          BG
        </text>
        {#if dragging && dragBox}
          <rect
            x={Math.min(dragging.x, dragBox.x) - parentPos.x}
            y={Math.min(dragging.y, dragBox.y) - parentPos.y}
            width={Math.abs(dragging.x - dragBox.x)}
            height={Math.abs(dragging.y - dragBox.y)}
            fill="steelblue"
            fill-opacity="0.5"
            class="pointer-events-none"
          />
        {/if}
      </g>
    </svg>
  </div>
  <div style="width: {width}px;" class="w-full px-4 ml-5">
    <DoubleRangeSlider bind:start={minA} bind:end={maxA} />
  </div>
</div>
<div class="h-full">
  <span>CIELAB L*</span>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="flex h-full">
    <div class="flex flex-col">
      <svg
        {height}
        width={80 + margin.left + margin.right}
        on:mouseleave={stopDrag}
        on:mouseup={stopDrag}
        on:touchend={stopDrag}
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
            on:mousemove={dragGenericZ}
            on:touchmove={dragGenericZ}
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
              on:touchstart={(e) => startDrag(e)}
            />
          {/each}
        </g>
      </svg>
      <button
        on:click={() => {
          minA = 0;
          maxA = 1;
          minB = 0;
          maxB = 1;
          minL = 0;
          maxL = 1;
        }}
      >
        Reset
      </button>
    </div>
    <div class="py-4" style="height: {height}px">
      <VerticalDoubleRangeSlider bind:start={minL} bind:end={maxL} />
    </div>
  </div>
</div>
