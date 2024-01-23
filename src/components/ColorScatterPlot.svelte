<script lang="ts">
  import type { Palette } from "../stores/color-store";
  import { Color, colorPickerConfig } from "../lib/Color";
  import {
    makePosAndSizes,
    toggleElement,
    selectColorsFromDragZ,
    selectColorsFromDrag,
    toXY,
    makeScales,
    dragEventToColorZ,
    dragEventToColorXY,
  } from "../lib/utils";
  import configStore from "../stores/config-store";
  import { scaleLinear } from "d3-scale";
  import simulate_cvd from "../lib/blindness";
  import ColorScatterPlotXyGuides from "./ColorScatterPlotXYGuides.svelte";
  import ColorScatterPlotPolarGuide from "./ColorScatterPlotPolarGuide.svelte";
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
  $: pickedColors = focusedColors
    .map((x) => colors[x])
    .filter((x) => x)
    .map((el) => [x(el), y(el), z(el)]);
  $: config = colorPickerConfig[colorSpace];
  $: bg = Pal.background;
  $: colors = Pal.colors.map((x) => Color.toColorSpace(x, colorSpace));

  $: domainXScale = scaleLinear().domain([0, 1]).range(config.xDomain);
  $: xScale = scaleLinear()
    .domain([domainXScale(extents.x[0]), domainXScale(extents.x[1])])
    .range([0, plotWidth]);

  $: rScale = scaleLinear()
    .domain([domainXScale(extents.x[0]), domainXScale(extents.x[1])])
    .range([0, plotWidth / 2]);

  $: domainYScale = scaleLinear().domain([0, 1]).range(config.yDomain);
  $: yScale = scaleLinear()
    .domain([domainYScale(extents.y[0]), domainYScale(extents.y[1])])
    .range([0, plotHeight]);

  $: domainZScale = scaleLinear().domain([0, 1]).range(config.zDomain);
  $: zScale = scaleLinear()
    .domain([domainZScale(extents.z[0]), domainZScale(extents.z[1])])
    .range([0, plotHeight]);

  $: angleScale = scaleLinear()
    .domain([0, 360])
    .range([0, 2 * Math.PI]);

  // bound box for selected colors
  $: pos = makePosAndSizes(pickedColors);

  let dragging: false | { x: number; y: number } = false;

  let originalColors = [] as Color[];

  $: luminance = bg.luminance();
  $: axisColor = luminance > 0.4 ? "#00000022" : "#ffffff55";
  $: textColor = luminance > 0.4 ? "#00000066" : "#ffffffaa";
  $: selectionColor = luminance > 0.35 ? "#55330066" : "#ffeeccaa";

  let hoveredPoint: Color | false = false;
  let hoverPoint = (x: typeof hoveredPoint) => (hoveredPoint = x);

  // coordinate transforms
  $: scales = makeScales(
    { rScale, angleScale, xScale, yScale, zScale },
    config
  );
  // color space -> screen
  $: x = scales.x;
  $: y = scales.y;
  $: z = scales.z;

  $: CircleProps = (color: Color, i: number) => ({
    cx: x(color),
    cy: y(color),
    r: 10,
    class: "cursor-pointer",
    fill: color.toDisplay(),
  });
  $: RectProps = (color: Color, i: number) => ({
    y: z(color),
    class: "cursor-pointer",
    fill: color.toDisplay(),
    x: 10 - (focusSet.has(i) ? 5 : 0),
    height: 5,
    width: 80 - 10 * 2 + (focusSet.has(i) ? 10 : 0),
  });
  $: outerDottedBoxStyle = {
    fill: "white",
    "fill-opacity": "0",
    "stroke-dasharray": "5,5",
    "stroke-width": "1",
    "stroke-opacity": focusedColors.length > 1 ? "1" : "0",
    cursor: "grab",
    stroke: selectionColor,
  };
  $: guideProps = {
    xScale,
    yScale,
    plotHeight,
    plotWidth,
    axisColor,
    textColor,
    colorSpace,
    dragging: interactionMode === "drag",
  };

  let interactionMode: "idle" | "drag" | "select" | "point-touch" = "idle";
  let dragTargetPos = { x: 0, y: 0 };
  let dragDelta = { x: 0, y: 0 };
  function dragStart(e: any) {
    startDragging();
    interactionMode = "drag";
    // console.log("drag start");
    const { x, y } = toXY(e);
    dragTargetPos = e.target.getBoundingClientRect();
    dragDelta = { x: dragTargetPos.x - x, y: dragTargetPos.y - y };
    originalColors = [...colors];
  }

  const dragUpdate = (isZ: boolean) => (e: any) => {
    // console.log("drag update");
    const dragToColor = isZ ? dragEventToColorZ : dragEventToColorXY;
    const newColors = colors.map((color, idx) => {
      if (!focusSet.has(idx)) {
        return color;
      }
      return dragToColor(
        e,
        originalColors[idx],
        dragTargetPos,
        config,
        scales,
        colorSpace,
        dragDelta
      );
    });

    onColorsChange(newColors);
  };
  function dragEnd(e: any) {
    interactionMode = "idle";
    stopDragging();
    // console.log("drag end");
  }

  let selectionMouseStart = { x: 0, y: 0 };
  let selectionMouseCurrent = { x: 0, y: 0 };
  let windowPos = { x: 0, y: 0 };
  let selectionIsZ = false;
  const selectionStart = (isZ: boolean) => (e: any) => {
    selectionIsZ = isZ;
    interactionMode = "select";
    // console.log("selection start");
    const { x, y } = toXY(e);
    selectionMouseStart = { x, y };
    selectionMouseCurrent = { x, y };
    windowPos = e.target.getBoundingClientRect();
  };
  const selectionUpdate = (isZ: boolean) => (e: any) => {
    // console.log("selection update");
    const { x, y } = toXY(e);
    selectionMouseCurrent = { x, y };
  };
  const selectionEnd = (isZ: boolean) => (e: any) => {
    interactionMode = "idle";
    const miniConfig = { isPolar: config.isPolar, plotHeight, plotWidth };
    const resp = isZ ? selectColorsFromDragZ : selectColorsFromDrag;
    const newFocus = resp(
      selectionMouseStart,
      selectionMouseCurrent,
      windowPos,
      colors,
      { ...miniConfig, ...scales }
    );
    onFocusedColorsChange(newFocus);
  };

  const pointMouseUp = (i: number) => (e: any) => {
    // console.log("point mouse up");
    interactionMode = "idle";
    const isMeta = e.metaKey || e.shiftKey;
    const newElements = isMeta ? toggleElement(focusedColors, i) : [i];

    onFocusedColorsChange(newElements);
  };

  const switchToDragPoint = (i: number) => (e: any) => {
    if (interactionMode !== "point-touch") return;
    startDragging();
    // console.log("switch to drag point");
    onFocusedColorsChange([i]);
    interactionMode = "drag";
  };

  const fillParamsXY = {
    x: 0,
    y: 0,
    width,
    height,
    opacity: 0,
    fill: "white",
  };
  const fillParamsZ = {
    x: margin.left,
    // y: margin.top,
    y: 0,
    width: 80,
    height,
    opacity: 0,
    fill: "white",
  };

  $: selectionBoxStyle = {
    x: Math.min(selectionMouseStart.x, selectionMouseCurrent.x) - windowPos.x,
    y: Math.min(selectionMouseStart.y, selectionMouseCurrent.y) - windowPos.y,
    width: Math.abs(selectionMouseStart.x - selectionMouseCurrent.x),
    height: Math.abs(selectionMouseStart.y - selectionMouseCurrent.y),
    fill: selectionColor,
    "fill-opacity": "0.5",
    class: "pointer-events-none",
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex pb-2" style="background: {bg.toDisplay()}">
  <div class="flex flex-col items-center">
    <span class="text-2xl" style="color: {textColor}">
      {config.title}
    </span>
    <div class="flex h-full">
      <div class="h-full py-4" style="max-height: {height}px"></div>
      <svg {width} {height} class="ml-2">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {#if config.isPolar}
            <ColorScatterPlotPolarGuide {...guideProps} {rScale} />
          {:else}
            <ColorScatterPlotXyGuides {...guideProps} />
          {/if}

          <rect
            {...fillParamsXY}
            on:touchstart|preventDefault={selectionStart(false)}
            on:mousedown|preventDefault={selectionStart(false)}
          />

          <g
            transform={config.isPolar
              ? `translate(${plotWidth / 2}, ${plotHeight / 2})`
              : ""}
          >
            <!-- background circle -->
            <g transform={`translate(${x(bg)}, ${y(bg)})`}>
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
              {#if scatterPlotMode === "moving"}
                <circle
                  {...CircleProps(color, i)}
                  r={10 + (focusSet.has(i) ? 5 : 0)}
                  on:mousedown|preventDefault={(e) => {
                    dragStart(e);
                    interactionMode = "point-touch";
                  }}
                  on:mouseup|preventDefault={pointMouseUp(i)}
                  on:mouseleave|preventDefault={switchToDragPoint(i)}
                />
              {/if}
              {#if scatterPlotMode === "looking"}
                <circle
                  {...CircleProps(color, i)}
                  on:mouseenter={() => hoverPoint(color)}
                />
              {/if}
              {#if !color.inGamut()}
                <GamutMarker xPos={x(color)} yPos={y(color)} />
              {/if}
            {/each}
            {#each blindColors as blindColor, i}
              <circle
                {...CircleProps(blindColor, i)}
                class="cursor-pointer"
                stroke={blindColor.toDisplay()}
                fill={"none"}
                stroke-width="4"
                on:mousedown|preventDefault={(e) => {
                  dragStart(e);
                  interactionMode = "point-touch";
                }}
                on:mouseup|preventDefault={pointMouseUp(i)}
                on:mouseleave|preventDefault={switchToDragPoint(i)}
              />
            {/each}
            <!-- simple tooltip -->
            {#if hoveredPoint}
              <g
                transform={`translate(${x(hoveredPoint) + 5}, ${
                  y(hoveredPoint) - 5
                })`}
              >
                <text fill={textColor}>{hoveredPoint.toDisplay()}</text>
              </g>
            {/if}
            <!-- selection target -->
            {#if focusedColors.length > 0}
              <rect
                id="dotted-box"
                x={pos.xPos - 5}
                y={pos.yPos - 5}
                width={pos.selectionWidth + 10}
                height={pos.selectionHeight + 10}
                {...outerDottedBoxStyle}
                on:touchstart|preventDefault={(e) => dragStart(e)}
                on:mousedown|preventDefault={(e) => dragStart(e)}
              />
            {/if}
          </g>
        </g>
        {#if interactionMode === "select"}
          <!-- selecting box -->
          {#if !selectionIsZ}
            <rect {...selectionBoxStyle} />
          {/if}
          <!-- selection target -->
          <rect
            {...fillParamsXY}
            on:touchmove|preventDefault={selectionUpdate(false)}
            on:mousemove|preventDefault={selectionUpdate(false)}
            on:touchend|preventDefault={selectionEnd(false)}
            on:mouseup|preventDefault={selectionEnd(false)}
          />
        {/if}
        {#if interactionMode === "drag"}
          <!-- selection target -->
          <rect
            {...fillParamsXY}
            on:touchmove|preventDefault={dragUpdate(false)}
            on:mousemove|preventDefault={dragUpdate(false)}
            on:touchend|preventDefault={(e) => dragEnd(e)}
            on:mouseup|preventDefault={(e) => dragEnd(e)}
          />
        {/if}
      </svg>
    </div>
  </div>
  <div class="h-full">
    <!-- invisible space inserter -->
    <span class=" text-xl opacity-0">X</span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex h-full">
      <div class="flex flex-col">
        <svg {height} width={80 + margin.left + margin.right} class="mt-1">
          <ColorScatterPlotZGuide {...guideProps} {zScale} {margin} />
          <rect
            {...fillParamsZ}
            on:touchstart|preventDefault={selectionStart(true)}
            on:mousedown|preventDefault={selectionStart(true)}
          />
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {#each colors as color, i}
              <rect
                {...RectProps(color, i)}
                on:mousedown|preventDefault={(e) => {
                  dragStart(e);
                  interactionMode = "point-touch";
                }}
                on:mouseup|preventDefault={pointMouseUp(i)}
                on:mouseleave|preventDefault={switchToDragPoint(i)}
              />
            {/each}
            {#each blindColors as color, i}
              <rect
                {...RectProps(color, i)}
                stroke={color.toDisplay()}
                fill={"none"}
                on:mousedown|preventDefault={(e) => {
                  dragStart(e);
                  interactionMode = "point-touch";
                }}
                on:mouseup|preventDefault={pointMouseUp(i)}
                on:mouseleave|preventDefault={switchToDragPoint(i)}
              />
            {/each}
            <!-- selection target -->
            {#if focusedColors.length > 0}
              <rect
                x={5}
                y={pos.zPos - 5}
                width={80 - 10}
                height={pos.selectionDepth + 15}
                {...outerDottedBoxStyle}
                on:touchstart|preventDefault={(e) => dragStart(e)}
                on:mousedown|preventDefault={(e) => dragStart(e)}
              />
            {/if}
          </g>
          {#if interactionMode === "select"}
            <!-- selecting box -->
            {#if selectionIsZ}
              <rect
                {...selectionBoxStyle}
                x={margin.left + 5}
                width={80 - 10}
              />
            {/if}
            <!-- selection target -->
            <rect
              {...fillParamsZ}
              on:touchmove|preventDefault={selectionUpdate(true)}
              on:mousemove|preventDefault={selectionUpdate(true)}
              on:touchend|preventDefault={selectionEnd(true)}
              on:mouseup|preventDefault={selectionEnd(true)}
            />
          {/if}
          {#if interactionMode === "drag"}
            <!-- selection target -->
            <rect
              {...fillParamsZ}
              on:touchmove|preventDefault={dragUpdate(true)}
              on:mousemove|preventDefault={dragUpdate(true)}
              on:touchend|preventDefault={(e) => dragEnd(e)}
              on:mouseup|preventDefault={(e) => dragEnd(e)}
            />
          {/if}
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
</style>
