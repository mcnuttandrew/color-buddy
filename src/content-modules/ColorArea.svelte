<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { Color, colorFromChannels } from "../lib/Color";
  import { scaleLinear } from "d3-scale";

  export let width = 256;
  export let height = 256;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);

  let minA = -100;
  let maxA = 100;
  let minB = -100;
  let maxB = 100;
  let minL = 0;
  let maxL = 100;

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  // A
  $: xScale = scaleLinear().domain([minA, maxA]).range([0, plotWidth]);
  // B
  $: yScale = scaleLinear().domain([maxB, minB]).range([0, plotHeight]);
  // L
  $: zScale = scaleLinear().domain([maxL, minL]).range([0, plotHeight]);

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
        on:mousedown={(e) => startDrag(e)}
        on:mousemove={(e) => {
          if (dragging && $focusStore.focusedColors.length > 0) {
            dragResponse(eventToColorXY)(e);
          }
          if (dragging && $focusStore.focusedColors.length === 0) {
            dragBox = { x: e.clientX, y: e.clientY };
          }
        }}
        on:mouseup={(e) => {
          if (dragBox && dragging) {
            selectColorsFromDrag(dragBox, dragging);
          }
          if (
            dragging &&
            dragging.x === e.clientX &&
            dragging.y === e.clientY
          ) {
            focusStore.clearColors();
          }

          dragging = false;
          dragBox = false;
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
          class="cursor-pointer transition-all"
          transform={`translate(${xScale(color.toChannels()[1])}, ${yScale(
            color.toChannels()[2]
          )})`}
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
  <div class="flex text-sm">
    <div class="flex flex-col">
      <label for="min-a">Min a*</label>
      <input
        class="w-full"
        type="number"
        id="min-a"
        min={-100}
        max={maxA}
        bind:value={minA}
        step={1}
      />
    </div>
    <div class="flex flex-col">
      <label for="max-a">Max a*</label>
      <input
        class="w-full"
        type="number"
        id="max-a"
        min={minA}
        max={100}
        bind:value={maxA}
        step={1}
      />
    </div>

    <div class="flex flex-col">
      <label for="min-b">Min b*</label>
      <input
        class="w-full"
        type="number"
        id="min-b"
        min={-100}
        max={maxB}
        bind:value={minB}
        step={1}
      />
    </div>
    <div class="flex flex-col">
      <label for="max-b">Max b*</label>
      <input
        class="w-full"
        type="number"
        id="max-b"
        min={minB}
        max={100}
        bind:value={maxB}
        step={1}
      />
    </div>

    <div class="flex flex-col">
      <label for="min-L">Min L*</label>
      <input
        class="w-full"
        type="number"
        id="min-L"
        min={0}
        max={maxL}
        bind:value={minL}
        step={1}
      />
    </div>
    <div class="flex flex-col">
      <label for="max-L">Max L*</label>
      <input
        class="w-full"
        type="number"
        id="max-L"
        min={minL}
        max={100}
        bind:value={maxL}
        step={1}
      />
    </div>
    <button
      on:click={() => {
        minA = -100;
        maxA = 100;
        minB = -100;
        maxB = 100;
        minL = 0;
        maxL = 100;
      }}
    >
      Reset
    </button>
  </div>
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
