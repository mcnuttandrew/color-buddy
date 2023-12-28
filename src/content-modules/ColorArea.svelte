<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import {
    Color,
    colorFromChannels,
    toColorSpace,
    colorPickerConfig,
  } from "../lib/Color";
  import { makeExtents, deDup } from "../lib/utils";
  import { scaleLinear } from "d3-scale";
  import DoubleRangeSlider from "../components/DoubleRangeSlider.svelte";
  import VerticalDoubleRangeSlider from "../components/VerticalDoubleRangeSlider.svelte";

  export let width = 256;
  export let height = 256;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);

  const margin = { top: 15, right: 15, bottom: 15, left: 15 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  let extents = { x: [0, 1], y: [0, 1], z: [0, 1] };
  $: pickedColors = focusedColors.map((x) => colors[x].toChannels());
  $: selectionExtents = makeExtents(pickedColors);
  $: xPos = xScale(selectionExtents.x[0] - 7.5);
  $: yPos = yScale(selectionExtents.y[0] - 7.5);
  $: selectionWidth =
    xScale(selectionExtents.x[1]) - xScale(selectionExtents.x[0]) + 30;
  $: selectionHeight =
    yScale(selectionExtents.y[1]) - yScale(selectionExtents.y[0]) + 30;

  $: config = colorPickerConfig[colorSpace];
  $: bg = $colorStore.currentPal.background;
  $: colorSpace = $colorStore.currentPal.colors[0].spaceName;
  $: colors = $colorStore.currentPal.colors.map((x) =>
    toColorSpace(x, colorSpace)
  );

  $: xRange = config.xDomain;
  $: domainXScale = scaleLinear().domain([0, 1]).range(xRange);
  $: xScale = scaleLinear()
    .domain([domainXScale(extents.x[0]), domainXScale(extents.x[1])])
    .range([0, plotWidth]);

  $: yRange = config.yDomain;
  $: domainYScale = scaleLinear().domain([0, 1]).range(yRange);
  $: yScale = scaleLinear()
    .domain([domainYScale(extents.y[0]), domainYScale(extents.y[1])])
    .range([0, plotHeight]);

  $: zRange = config.zDomain;
  $: domainLScale = scaleLinear().domain([0, 1]).range(zRange);
  $: zScale = scaleLinear()
    .domain([domainLScale(extents.z[0]), domainLScale(extents.z[1])])
    .range([0, plotHeight]);

  let dragging: false | { x: number; y: number } = false;
  let dragBox: false | { x: number; y: number } = false;
  let parentPos = { x: 0, y: 0 };
  const clampToRange = (val: number, range: number[]) => {
    const min = Math.min(...range);
    const max = Math.max(...range);
    return Math.min(Math.max(val, min), max);
  };
  const eventToColorXY = (
    e: any,
    color: Color,
    originalColor: Color
  ): Color => {
    if (!dragging || dragging.x === undefined || dragging.y === undefined)
      return color;

    const { x, y } = toXY(e);

    const screenPosDelta = {
      x: x - dragging.x,
      y: y - dragging.y,
    };
    const [l, a, b] = originalColor.toChannels();
    const newX = xScale.invert(xScale(a) + screenPosDelta.x);
    const newY = yScale.invert(yScale(b) + screenPosDelta.y);

    return colorFromChannels(
      [l, clampToRange(newX, xRange), clampToRange(newY, yRange)],
      colorSpace
    );
  };

  const eventToColorZ = (e: any, color: Color, originalColor: Color): Color => {
    if (!dragging || dragging.x === undefined || dragging.y === undefined)
      return color;

    const screenPosDelta = toXY(e).y - dragging.y;
    const [l, a, b] = originalColor.toChannels();
    const newZ = zScale.invert(zScale(l) + screenPosDelta);

    return colorFromChannels([clampToRange(newZ, zRange), a, b], colorSpace);
  };

  function stopDrag() {
    dragging = false;
    dragBox = false;
  }

  let originalColors = [] as Color[];
  let isXYDrag = true;
  const startDrag = (isXYDrag: boolean) => (e: any) => {
    isXYDrag = isXYDrag;
    parentPos = e.target.getBoundingClientRect();
    const { x, y } = toXY(e);
    dragging = { x, y };
    originalColors = [...colors];

    if ($focusStore.focusedColors.length === 0) {
      dragBox = { x, y };
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
    focusStore.setColors([...newFocusedColors]);
  }
  $: points = {
    centerTop: {
      x: (xScale.range()[1] - xScale.range()[0]) / 2,
      y: yScale.range()[0],
      anchor: "end",
      label: `${config.yChannel}: ${yScale.domain()[0].toFixed(1)}`,
    },
    centerBottom: {
      x: (xScale.range()[1] - xScale.range()[0]) / 2,
      y: yScale.range()[1],
      anchor: "start",
      label: yScale.domain()[1].toFixed(1),
    },
    centerLeft: {
      x: xScale.range()[0],
      y: (yScale.range()[1] - yScale.range()[0]) / 2,
      anchor: "start",
      label: xScale.domain()[0].toFixed(1),
    },
    centerRight: {
      x: xScale.range()[1],
      y: (yScale.range()[1] - yScale.range()[0]) / 2,
      anchor: "end",
      label: `${config.xChannel}: ${xScale.domain()[1].toFixed(1)}`,
    },
  };
  $: axisColor = bg.toChroma().luminance() > 0.5 ? "gray" : "white";

  const toXY = (e: any) => {
    const touches = e?.touches?.length ? e.touches : e?.changedTouches || [];
    const x = [...touches].at(0)?.clientX || e.clientX;
    const y = [...touches].at(0)?.clientY || e.clientY;
    return { x, y };
  };
  function rectMoveResponse(e: any) {
    const { x, y } = toXY(e);
    if (dragging && $focusStore.focusedColors.length > 0) {
      dragResponse(eventToColorXY)(e);
    }
    if (dragging && $focusStore.focusedColors.length === 0) {
      dragBox = { x, y };
    }
  }
  function rectMoveResponseZ(e: any) {
    const { x, y } = toXY(e);
    if (dragging && $focusStore.focusedColors.length > 0) {
      dragResponse(eventToColorZ)(e);
    }
    if (dragging && $focusStore.focusedColors.length === 0) {
      dragBox = { x, y };
    }
  }
  function rectMoveEnd(e: any) {
    if (dragBox && dragging) {
      selectColorsFromDrag(dragBox, dragging);
    }
    const { x, y } = toXY(e);
    if (dragging && dragging.x === x && dragging.y === y) {
      focusStore.clearColors();
    }

    dragging = false;
    dragBox = false;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-col">
  <select
    value={colors[0] && colors[0].spaceName}
    on:change={(e) => {
      const newColors = colors.map((color) =>
        // @ts-ignore
        toColorSpace(color, e.target.value)
      );
      colorStore.setCurrentPalColors(newColors);
    }}
  >
    {#each Object.entries(colorPickerConfig) as [space, { title }]}
      <option value={space}>{title}</option>
    {/each}
  </select>
  <span>{config.xyTitle}</span>
  <div class="flex h-full">
    <div class="h-full py-4" style="max-height: {height}px">
      <VerticalDoubleRangeSlider
        bind:start={extents.y[0]}
        bind:end={extents.y[1]}
      />
    </div>
    <svg
      {width}
      {height}
      on:mouseleave={stopDrag}
      on:mouseup={stopDrag}
      on:touchend={stopDrag}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <rect
          x={0}
          y={0}
          width={xScale.range()[1]}
          height={yScale.range()[1]}
          fill={bg.toHex()}
          stroke={axisColor}
          stroke-width="1"
        />
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
          <text text-anchor={point.anchor} x={point.x} y={point.y}>
            {point.label}
          </text>
        {/each}

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <rect
          on:touchstart|preventDefault={startDrag(true)}
          on:mousedown|preventDefault={startDrag(true)}
          on:touchmove|preventDefault={rectMoveResponse}
          on:mousemove|preventDefault={rectMoveResponse}
          on:touchend|preventDefault={rectMoveEnd}
          on:mouseup|preventDefault={rectMoveEnd}
          x="0"
          y="0"
          {width}
          {height}
          opacity="0"
          fill="white"
          class:cursor-pointer={dragging}
        />

        {#each deDup(colors) as color, i (color)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <circle
            on:mousedown|preventDefault={startDrag(true)}
            on:touchstart|preventDefault={startDrag(true)}
            on:touchend|preventDefault={() => {
              focusStore.setColors([i]);
            }}
            pointer-events={!focusSet.has(i) ? "all" : "none"}
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
        {#if dragging && dragBox && isXYDrag}
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
        {#if pickedColors.length}
          <rect
            x={xPos - 5}
            y={yPos - 5}
            width={selectionWidth + 10}
            height={selectionHeight + 10}
            stroke="steelblue"
            fill="white"
            fill-opacity="0"
            pointer-events="none"
            stroke-dasharray="5,5"
            stroke-width="2"
            cursor="grab"
          />
        {/if}
      </g>
    </svg>
  </div>
  <div style="width: {width}px;" class="w-full px-4 ml-5">
    <DoubleRangeSlider bind:start={extents.x[0]} bind:end={extents.x[1]} />
  </div>
</div>
<div class="h-full mt-5">
  <span>{config.zTitle}</span>
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
            class:cursor-pointer={dragging}
            on:touchstart|preventDefault={startDrag(false)}
            on:mousedown|preventDefault={startDrag(false)}
            on:touchmove|preventDefault={rectMoveResponseZ}
            on:mousemove|preventDefault={rectMoveResponseZ}
            on:touchend|preventDefault={rectMoveEnd}
            on:mouseup|preventDefault={rectMoveEnd}
          />
          <!-- on:mousemove={(e) => {
              if (dragging) {
                dragResponse(eventToColorZ)(e);
              }
            }} -->
          {#each deDup(colors) as color, i}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <rect
              x={10 - (focusSet.has(i) ? 5 : 0)}
              class="cursor-pointer"
              y={zScale(color.toChannels()[0])}
              width={80 - 10 * 2 + (focusSet.has(i) ? 10 : 0)}
              height={5}
              fill={color.toHex()}
              on:click={() => focusStore.toggleColor(i)}
              on:mousedown|preventDefault={startDrag(false)}
              on:touchstart|preventDefault={startDrag(false)}
              on:touchend|preventDefault={() => {
                focusStore.setColors([i]);
              }}
            />
          {/each}
          {#if dragging && dragBox && !isXYDrag}
            <rect
              x={5}
              y={Math.min(dragging.y, dragBox.y) - parentPos.y}
              width={80 - 10}
              height={Math.abs(dragging.y - dragBox.y)}
              fill="steelblue"
              fill-opacity="0.5"
              class="pointer-events-none"
            />
          {/if}
        </g>
      </svg>
      <button
        on:click={() => {
          extents = { x: [0, 1], y: [0, 1], z: [0, 1] };
        }}
      >
        Reset
      </button>
    </div>
    <div class="py-4" style="height: {height}px">
      <VerticalDoubleRangeSlider
        bind:start={extents.z[0]}
        bind:end={extents.z[1]}
      />
    </div>
  </div>
</div>
