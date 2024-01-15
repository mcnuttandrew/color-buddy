<script lang="ts">
  import type { Palette } from "../stores/color-store";
  import {
    Color,
    colorFromChannels,
    toColorSpace,
    colorPickerConfig,
  } from "../lib/Color";
  import {
    makePosAndSizes,
    deDup,
    toggleElement,
    clampToRange,
  } from "../lib/utils";
  import configStore from "../stores/config-store";
  import { scaleLinear } from "d3-scale";
  import simulate_cvd from "../lib/blindness";
  import ColorScatterPlotXyGuides from "./ColorScatterPlotXYGuides.svelte";
  import ColorScatterPlotZGuide from "./ColorScatterPlotZGuide.svelte";
  import GamutMarker from "./GamutMarker.svelte";

  export let scatterPlotMode: "moving" | "looking";

  export let Pal: Palette;
  export let focusedColors: number[];

  export let width = 256;
  export let height = 256;
  export let onColorsChange: (color: Color[]) => void;
  export let onFocusedColorsChange: (color: number[]) => void;
  export let startDragging: () => void;
  export let stopDragging: () => void;
  export let colorSpace: any;

  $: selectedBlindType = $configStore.colorSim;
  $: blindColors =
    selectedBlindType === "none"
      ? []
      : Pal.colors.map((x) => simulate_cvd(selectedBlindType as any, x));

  $: focusSet = new Set(focusedColors);

  const margin = { top: 15, right: 15, bottom: 15, left: 15 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  $: extents = {
    x: $configStore.xZoom,
    y: $configStore.yZoom,
    z: $configStore.zZoom,
  };
  $: pickedColors = focusedColors.map((x) => colors[x].toChannels());
  $: config = colorPickerConfig[colorSpace];
  $: bg = Pal.background;
  $: colors = Pal.colors.map((x) => toColorSpace(x, colorSpace));

  $: xRange = config.xDomain;
  $: domainXScale = scaleLinear().domain([0, 1]).range(xRange);
  const makeDomain = (range: number[], extent: number[], scale: any) => [
    // range[0] > range[1] ? scale(extent[1]) : scale(extent[0]),
    // range[0] > range[1] ? scale(extent[0]) : scale(extent[1]),
    scale(extent[0]),
    scale(extent[1]),
  ];
  $: xScale = scaleLinear()
    .domain(makeDomain(xRange, extents.x, domainXScale))
    .range([0, plotWidth]);

  $: yRange = config.yDomain;
  $: domainYScale = scaleLinear().domain([0, 1]).range(yRange);
  $: yScale = scaleLinear()
    .domain(makeDomain(yRange, extents.y, domainYScale))
    .range([0, plotHeight]);

  $: zRange = config.zDomain;
  $: domainLScale = scaleLinear().domain([0, 1]).range(zRange);
  $: zScale = scaleLinear()
    .domain([domainLScale(extents.z[0]), domainLScale(extents.z[1])])
    .range([0, plotHeight]);

  $: pos = makePosAndSizes(pickedColors, xScale, yScale, zScale);

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
  let isMainBoxDrag = true;
  let isPointDrag = false;
  const startDrag = (isXYDrag: boolean, idx?: number) => (e: any) => {
    if (scatterPlotMode !== "moving") return;
    // console.log("start drag", e.target);
    startDragging();
    const targetIsPoint = typeof idx === "number";
    let target = e.target;
    const isMetaKey = e.metaKey || e.shiftKey;
    isPointDrag = false;
    if (targetIsPoint && !focusSet.has(idx)) {
      const newSet = isMetaKey ? [...focusSet, idx] : [idx];
      onFocusedColorsChange(newSet);
      isPointDrag = true;
    }

    isMainBoxDrag = isXYDrag;
    parentPos = target.getBoundingClientRect();
    const { x, y } = toXY(e);
    dragging = { x, y };
    originalColors = [...colors];

    if (focusedColors.length === 0) {
      dragBox = { x, y };
    } else {
      dragBox = false;
    }
  };

  type Func = typeof eventToColorZ | typeof eventToColorZ;
  const dragResponse = (func: Func) => (e: any) => {
    const newColors = colors.map((color, idx) =>
      focusSet.has(idx) ? func(e, color, originalColors[idx]) : color
    );

    onColorsChange(newColors);
  };

  const toXY = (e: any) => {
    const touches = e?.touches?.length ? e.touches : e?.changedTouches || [];
    const x = [...touches].at(0)?.clientX || e.clientX;
    const y = [...touches].at(0)?.clientY || e.clientY;
    return { x, y };
  };
  const rectMoveResponse = (isZ: boolean) => (e: any) => {
    // console.log("rect move response");
    if (!dragging || scatterPlotMode !== "moving") return;
    const { x, y } = toXY(e);
    if (dragging && focusedColors.length > 0) {
      dragResponse(isZ ? eventToColorZ : eventToColorXY)(e);
    }
    if (dragging && focusedColors.length === 0) {
      dragBox = { x, y };
    }
  };

  const rectMoveEnd = (isZ: boolean) => (e: any) => {
    // console.log("rect move end");
    stopDragging();
    if (scatterPlotMode !== "moving") return;
    if (!isPointDrag && dragBox && dragging) {
      (isZ ? selectColorsFromDragZ : selectColorsFromDrag)(dragBox, dragging);
    }
    const { x, y } = toXY(e);
    if (!isPointDrag && dragging && dragging.x === x && dragging.y === y) {
      onFocusedColorsChange([]);
    }

    dragging = false;
    dragBox = false;
  };

  const dragExtent = (
    dragBox: { x: number; y: number },
    dragging: { x: number; y: number }
  ) => {
    const xMin = Math.min(dragging.x, dragBox.x) - parentPos.x;
    const xMax = Math.max(dragging.x, dragBox.x) - parentPos.x;
    const yMin = Math.min(dragging.y, dragBox.y) - parentPos.y;
    const yMax = Math.max(dragging.y, dragBox.y) - parentPos.y;
    return { xMin, xMax, yMin, yMax };
  };
  function selectColorsFromDrag(
    dragBox: { x: number; y: number },
    dragging: { x: number; y: number }
  ) {
    const { xMin, xMax, yMin, yMax } = dragExtent(dragBox, dragging);

    const newFocusedColors = colors
      .map((color, idx) => {
        const [_l, a, b] = color.toChannels();
        const [x, y] = [xScale(a), yScale(b)];
        return xMin <= x && x <= xMax && yMin <= y && y <= yMax ? idx : -1;
      })
      .filter((x) => x !== -1);
    onFocusedColorsChange([...newFocusedColors]);
  }
  function selectColorsFromDragZ(
    dragBox: { x: number; y: number },
    dragging: { x: number; y: number }
  ) {
    const { yMin, yMax } = dragExtent(dragBox, dragging);
    const newFocusedColors = colors
      .map((color, idx) => {
        const y = zScale(color.toChannels()[0]);
        return yMin <= y && y <= yMax ? idx : -1;
      })
      .filter((x) => x !== -1);
    onFocusedColorsChange([...newFocusedColors]);
  }

  $: luminance = bg.luminance();
  $: axisColor = luminance > 0.4 ? "#00000022" : "#ffffff55";
  $: textColor = luminance > 0.4 ? "#00000066" : "#ffffffaa";
  $: selectionColor = luminance > 0.35 ? "#55330066" : "#ffeeccaa";

  let hoveredPoint: Color | false = false;
  let hoverPoint = (x: typeof hoveredPoint) => (hoveredPoint = x);
  $: x = (point: Color) => xScale(point.toChannels()[1]);
  $: y = (point: Color) => yScale(point.toChannels()[2]);
  $: z = (point: Color) => zScale(point.toChannels()[0]);

  function clickResponse(e: any, i: number) {
    if (e.metaKey || e.shiftKey) {
      onFocusedColorsChange(toggleElement(focusedColors, i));
    } else {
      onFocusedColorsChange([i]);
    }
  }

  let CircleProps = (color: Color) => ({
    cx: x(color),
    cy: y(color),
    r: 10,
    class: "cursor-pointer",
    fill: color.toDisplay(),
  });
  let RectProps = (color: Color, i: number) => ({
    y: z(color),
    class: "cursor-pointer",
    fill: color.toDisplay(),
    x: 10 - (focusSet.has(i) ? 5 : 0),
    height: 5,
    width: 80 - 10 * 2 + (focusSet.has(i) ? 10 : 0),
  });
  $: SelectionBoxStyles = {
    fill: "white",
    "fill-opacity": "0",
    "pointer-events": "none",
    "stroke-dasharray": "5,5",
    "stroke-width": "1",
    cursor: "grab",
    stroke: selectionColor,
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex" style="background: {bg.toDisplay()}">
  <div class="flex flex-col items-center">
    <span class="text-2xl" style="color: {textColor}">
      {config.title}
    </span>
    <div class="flex h-full">
      <div class="h-full py-4" style="max-height: {height}px"></div>
      <svg
        {width}
        {height}
        class="ml-2"
        on:mouseleave={stopDrag}
        on:mouseup={stopDrag}
        on:touchend={stopDrag}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <ColorScatterPlotXyGuides
            {xScale}
            {yScale}
            {plotHeight}
            {plotWidth}
            {axisColor}
            {textColor}
            {colorSpace}
            dragging={!!dragging}
          />

          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <rect
            on:touchstart|preventDefault={startDrag(true)}
            on:mousedown|preventDefault={startDrag(true)}
            on:touchmove|preventDefault={rectMoveResponse(false)}
            on:mousemove|preventDefault={rectMoveResponse(false)}
            on:touchend|preventDefault={rectMoveEnd(false)}
            on:mouseup|preventDefault={rectMoveEnd(false)}
            x="0"
            y="0"
            {width}
            {height}
            opacity="0"
            fill="white"
            class:cursor-pointer={dragging}
          />

          <!-- background circle -->
          <g
            transform={`translate(${x(bg)}, ${y(bg)})`}
            class="pointer-events-none"
          >
            <circle r={15} stroke={axisColor} fill={bg.toDisplay()} />
            <text
              fill={textColor}
              font-size={12}
              text-anchor="middle"
              dominant-baseline="central"
            >
              BG
            </text>
          </g>
          <!-- main colors -->
          {#each colors as color, i}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            {#if scatterPlotMode === "moving"}
              <circle
                {...CircleProps(color)}
                on:mousedown|preventDefault={(e) => startDrag(true, i)(e)}
                on:touchstart|preventDefault={startDrag(true, i)}
                on:touchend|preventDefault={() => onFocusedColorsChange([i])}
                pointer-events={!focusSet.has(i) ? "all" : "none"}
                r={10 + (focusSet.has(i) ? 5 : 0)}
                stroke={focusedColors.length === 1 &&
                focusedColors[0] === i &&
                dragging
                  ? axisColor
                  : color.toDisplay()}
                on:click={(e) => clickResponse(e, i)}
              />
            {/if}
            {#if scatterPlotMode === "looking"}
              <circle
                {...CircleProps(color)}
                on:mouseenter={() => hoverPoint(color)}
              />
            {/if}
            {#if !color.inGamut()}
              <GamutMarker xPos={x(color)} yPos={y(color)} />
            {/if}
          {/each}
          {#each blindColors as blindColor, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <circle
              {...CircleProps(blindColor)}
              class="cursor-pointer"
              stroke={blindColor.toDisplay()}
              fill={"none"}
              stroke-width="4"
              on:mousedown|preventDefault={startDrag(true, i)}
              on:touchstart|preventDefault={startDrag(true, i)}
              on:touchend|preventDefault={() => onFocusedColorsChange([i])}
              pointer-events={!focusSet.has(i) ? "all" : "none"}
              on:click={(e) => clickResponse(e, i)}
            />
          {/each}
          <!-- simple tooltip -->
          {#if scatterPlotMode === "looking" && hoveredPoint}
            <g
              transform={`translate(${xScale(hoveredPoint.toChannels()[1])},
                ${yScale(hoveredPoint.toChannels()[2])})`}
            >
              <text fill={textColor}>{hoveredPoint.toDisplay()}</text>
            </g>
          {/if}

          <!-- selection box -->
          {#if dragging && dragBox && isMainBoxDrag}
            <rect
              x={Math.min(dragging.x, dragBox.x) - parentPos.x}
              y={Math.min(dragging.y, dragBox.y) - parentPos.y}
              width={Math.abs(dragging.x - dragBox.x)}
              height={Math.abs(dragging.y - dragBox.y)}
              fill={selectionColor}
              fill-opacity="0.5"
              class="pointer-events-none"
            />
          {/if}
          {#if pickedColors.length > 1}
            <rect
              x={pos.xPos - 5}
              y={pos.yPos - 5}
              width={pos.selectionWidth + 10}
              height={pos.selectionHeight + 10}
              {...SelectionBoxStyles}
            />
          {/if}
        </g>
      </svg>
    </div>
  </div>
  <div class="h-full">
    <span class=" text-xl opacity-0">X</span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex h-full">
      <div class="flex flex-col">
        <svg
          {height}
          width={80 + margin.left + margin.right}
          class="mt-3"
          on:mouseleave={stopDrag}
          on:mouseup={stopDrag}
          on:touchend={stopDrag}
        >
          <ColorScatterPlotZGuide
            {yScale}
            {zScale}
            {textColor}
            {colorSpace}
            {axisColor}
          />
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <rect
              x={0}
              y={0}
              width={80}
              height={yScale.range()[1]}
              fill="white"
              opacity="0"
              class:cursor-pointer={dragging}
              on:touchstart|preventDefault={startDrag(false)}
              on:mousedown|preventDefault={startDrag(false)}
              on:touchmove|preventDefault={rectMoveResponse(true)}
              on:mousemove|preventDefault={rectMoveResponse(true)}
              on:touchend|preventDefault={rectMoveEnd(true)}
              on:mouseup|preventDefault={rectMoveEnd(true)}
            />

            {#each colors as color, i}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <rect
                {...RectProps(color, i)}
                pointer-events={!focusSet.has(i) ? "all" : "none"}
                on:click={(e) => clickResponse(e, i)}
                on:mousedown|preventDefault={startDrag(false, i)}
                on:touchstart|preventDefault={startDrag(false, i)}
                on:touchend|preventDefault={() => onFocusedColorsChange([i])}
              />
            {/each}
            {#each blindColors as color, i}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <rect
                {...RectProps(color, i)}
                stroke={color.toDisplay()}
                fill={"none"}
                pointer-events={!focusSet.has(i) ? "all" : "none"}
                on:click={(e) => clickResponse(e, i)}
                on:mousedown|preventDefault={startDrag(false, i)}
                on:touchstart|preventDefault={startDrag(false, i)}
                on:touchend|preventDefault={() => onFocusedColorsChange([i])}
              />
            {/each}
            <!-- selection box -->
            {#if dragging && dragBox && !isMainBoxDrag}
              <rect
                x={5}
                y={Math.min(dragging.y, dragBox.y) - parentPos.y}
                width={80 - 10}
                height={Math.abs(dragging.y - dragBox.y)}
                fill={selectionColor}
                class="pointer-events-none"
              />
            {/if}
            {#if pickedColors.length}
              <rect
                x={5}
                y={pos.zPos - 5}
                width={80 - 10}
                height={pos.selectionDepth + 15}
                {...SelectionBoxStyles}
              />
            {/if}
          </g>
        </svg>
      </div>
    </div>
  </div>
</div>

<style>
  circle {
    transition: r 0.2s ease-in-out;
    -webkit-transition: r 0.2s ease-in-out;
    -moz-transition: r 0.2s ease-in-out;
  }

  svg {
    overflow: visible;
  }
</style>
