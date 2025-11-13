<script lang="ts">
  import { Color } from "color-buddy-palette";
  import type { Palette } from "color-buddy-palette";

  import { colorPickerConfig } from "../lib/utils";
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
  import ColorScatterPlotXyGuides from "./ColorScatterPlotXYGuides.svelte";
  import ColorScatterPlotPolarGuide from "./ColorScatterPlotPolarGuide.svelte";
  import ColorScatterPlotZGuide from "./ColorScatterPlotZGuide.svelte";
  import GamutMarker from "./GamutMarker.svelte";
  import { computeStroke } from "../lib/utils";

  export let scatterPlotMode: "moving" | "looking" | "putting";

  export let Pal: Palette;
  export let focusedColors: number[];

  export let width = 256;
  export let height = 256;
  $: zWidth = 80;
  export let onColorsChange: (color: Color[]) => void;
  export let onFocusedColorsChange: (color: number[]) => void;
  export let startDragging: () => void;
  export let stopDragging: () => void;
  export let colorSpace: any;
  export let annotationColors: Color[] = [];
  export let showLines = false;

  $: focusSet = new Set(focusedColors);

  let margin = { top: 20, right: 15, bottom: 15, left: 15 };
  $: plotWidth = width - margin.left - margin.right;
  $: plotHeight = height - margin.top - margin.bottom;
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
    .domain([
      domainXScale(extents.x[0]) ?? config.xDomain[0],
      domainXScale(extents.x[1]) ?? config.xDomain[1]
    ])
    .range([0, plotWidth]);

  $: rScale = scaleLinear()
    .domain([
        domainXScale(extents.x[0]) ?? config.xDomain[0],
        domainXScale(extents.x[1]) ?? config.xDomain[1]
      ])
    .range([0, plotWidth / 2]);

  $: domainYScale = scaleLinear().domain([0, 1]).range(config.yDomain);
  $: yScale = scaleLinear()
    .domain([
      domainXScale(extents.x[0]) ?? config.xDomain[0],
      domainXScale(extents.x[1]) ?? config.xDomain[1]
    ])
    .range([0, plotHeight]);

  $: domainZScale = scaleLinear().domain([0, 1]).range(config.zDomain);
  $: zScale = scaleLinear()
    .domain([
      domainXScale(extents.x[0]) ?? config.xDomain[0],
      domainXScale(extents.x[1]) ?? config.xDomain[1]
    ])
    .range([0, plotHeight]);

  $: angleScale = scaleLinear()
    .domain([360, 0])
    .range([0, 2 * Math.PI]);

  // bound box for selected colors
  $: pos = makePosAndSizes(pickedColors);

  let originalColors = [] as Color[];
  $: bgLum = bg.luminance();
  const findColorWithTag = (
    colors: Color[],
    tag: string
  ): Color | undefined => {
    return colors.find((x) =>
      x.tags.some((y) => y.toLowerCase() === tag.toLowerCase())
    );
  };
  $: taggedAxisColor = findColorWithTag(colors, "axis");
  $: axisColor = taggedAxisColor
    ? taggedAxisColor.toHex()
    : bgLum > 0.4
      ? "#00000022"
      : "#ffffff55";
  $: taggedTextColor = findColorWithTag(colors, "text");
  $: textColor = taggedTextColor
    ? taggedTextColor.toHex()
    : bgLum > 0.4
      ? "#00000066"
      : "#ffffffaa";
  $: selectionColor = bgLum > 0.35 ? "#55330066" : "#ffeeccaa";

  let hoveredIndex: number | false = false;
  $: hoveredPoint =
    hoveredIndex === false || !colors[hoveredIndex]
      ? false
      : colors[hoveredIndex];

  // coordinate transforms
  $: scales = makeScales(
    { rScale, angleScale, xScale, yScale, zScale },
    config
  );
  // color space -> screen
  $: x = scales.x;
  $: y = scales.y;
  $: z = scales.z;

  $: CircleProps = (color: Color, i: number) => {
    let xPos = x(color);
    let yPos = y(color);
    if (isNaN(xPos)) xPos = config.isPolar ? 0 : plotWidth / 2;
    if (isNaN(yPos)) yPos = config.isPolar ? 0 : plotHeight / 2;    
    return {
      cx: xPos,
      cy: yPos,
      class: "cursor-pointer",
      fill: color.toDisplay(),
      r: 10 + (focusSet.has(i) ? 5 : 0),
    };
  };
  $: RectProps = (color: Color, i: number) => {
    let zPos = z(color);
    if (isNaN(zPos)) zPos = plotHeight / 2;  
    return {
      y: zPos,
      class: "cursor-pointer",
      fill: color.toDisplay(),
      x: 10 - (focusSet.has(i) ? 5 : 0),
      height: 5,
      width: zWidth - 10 * 2 + (focusSet.has(i) ? 10 : 0),
    };
  };
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

  let interactionMode:
    | "idle"
    | "drag"
    | "select"
    | "point-touch"
    | "stretch"
    | "rotate" = "idle";
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

  let dragUpdate = (isZ: boolean) => (e: any) => {
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
  const dragEnd = (isZ: boolean) => (e: any) => {
    if (isZ) {
      dragUpdate(isZ)(e);
    }
    interactionMode = "idle";
    stopDragging();
    // console.log("drag end");
  };

  let selectionMouseStart = { x: 0, y: 0 };
  let selectionMouseCurrent = { x: 0, y: 0 };
  let windowPos = { x: 0, y: 0 };
  let selectionIsZ = false;
  let selectionStart = (isZ: boolean) => (e: any) => {
    hoveredPoint = false;
    selectionIsZ = isZ;
    interactionMode = "select";
    // console.log("selection start");
    const { x, y } = toXY(e);
    selectionMouseStart = { x, y };
    selectionMouseCurrent = { x, y };
    windowPos = e.target.getBoundingClientRect();
  };
  let selectionUpdate = (isZ: boolean) => (e: any) => {
    // console.log("selection update");
    const { x, y } = toXY(e);
    selectionMouseCurrent = { x: x + 10, y: y + 20 };
  };
  let selectionEnd = (isZ: boolean) => (e: any) => {
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

  let pointMouseDown = (e: any) => {
    dragStart(e);
    interactionMode = "point-touch";
  };
  let pointMouseUp = (i: number) => (e: any) => {
    // console.log("point mouse up");
    interactionMode = "idle";
    const isMeta = e.metaKey || e.shiftKey;
    const newElements = isMeta ? toggleElement(focusedColors, i) : [i];

    onFocusedColorsChange(newElements);
  };

  let switchToDragPoint = (i: number) => (e: any) => {
    if (interactionMode !== "point-touch") return;
    startDragging();
    // console.log("switch to drag point");
    onFocusedColorsChange([i]);
    interactionMode = "drag";
  };

  let hoverPoint = (i: number) => {
    hoveredIndex = i;
  };

  const fillParamsXY = {
    x: 0,
    y: 0,
    width,
    height,
    opacity: 0,
    fill: "white",
  };
  $: fillParamsZ = {
    x: margin.left,
    y: 0,
    width: zWidth,
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

  let puttingPreview: false | Color = false;

  function puttingUpdate(e: any) {
    let currentPos = toXY(e);
    const box = svgContainer.getBoundingClientRect();
    currentPos = {
      x: currentPos.x - box.x,
      y: currentPos.y - box.y,
    };
    if (config.isPolar) {
      currentPos.x = currentPos.x - plotWidth / 2;
      currentPos.y = currentPos.y - plotHeight / 2;
    }
    const newX = scales.xInv(currentPos.x, currentPos.y);
    const newY = scales.yInv(currentPos.x, currentPos.y);
    const newZ = scales.zInv(plotHeight / 2);
    const newChannels = [0, 0, 0] as [number, number, number];
    newChannels[config.xChannelIndex] = newX;
    newChannels[config.yChannelIndex] = newY;
    newChannels[config.zChannelIndex] = newZ;
    puttingPreview = Color.colorFromChannels(newChannels, colorSpace);
  }

  function puttingEnd() {
    if (!puttingPreview) return;
    onColorsChange([...colors, puttingPreview as Color]);
    setTimeout(() => {
      configStore.setScatterplotMode("moving");
    }, 10);
    puttingPreview = false;
  }
  let svgContainer: any;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex pb-2" style="background: {bg.toDisplay()}" id="scatterplot">
  <div class="flex flex-col items-center">
    <div class="flex h-full">
      <div class="h-full py-4" style="max-height: {height}px"></div>
      <svg
        {width}
        {height}
        class="ml-2"
        bind:this={svgContainer}
        on:mouseleave={interactionMode === "drag"
          ? dragEnd(false)
          : interactionMode === "select"
            ? selectionEnd(false)
            : () => {}}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {#if config.isPolar}
            <ColorScatterPlotPolarGuide {...guideProps} {rScale} />
          {:else}
            <ColorScatterPlotXyGuides {...guideProps} />
          {/if}

          <rect
            {...fillParamsXY}
            on:mousedown|preventDefault={selectionStart(false)}
            on:touchstart|preventDefault={selectionStart(false)}
            on:touchmove|preventDefault={interactionMode === "drag"
              ? dragUpdate(false)
              : selectionUpdate(false)}
            on:touchend|preventDefault={interactionMode === "drag"
              ? dragEnd(false)
              : selectionEnd(false)}
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
                  stroke={computeStroke(color, i, focusSet, bg)}
                  on:touchstart|preventDefault={(e) => {
                    onFocusedColorsChange([i]);
                    dragStart(e);
                  }}
                  on:touchmove|preventDefault={dragUpdate(false)}
                  on:touchend|preventDefault={dragEnd(false)}
                  on:mousedown|preventDefault={pointMouseDown}
                  on:mouseup|preventDefault={pointMouseUp(i)}
                  on:mouseleave|preventDefault={switchToDragPoint(i)}
                  on:mouseenter|preventDefault={() => hoverPoint(i)}
                />
              {/if}
              {#if scatterPlotMode !== "moving"}
                <circle
                  {...CircleProps(color, i)}
                  stroke={computeStroke(color, i, focusSet, bg)}
                  on:mouseenter|preventDefault={() => hoverPoint(i)}
                />
              {/if}
              {#if !color.inGamut() && $configStore.showGamutMarkers}
                <GamutMarker
                  xPos={x(color)}
                  yPos={y(color)}
                  lum={color.luminance()}
                  selected={focusSet.has(i)}
                />
              {/if}
            {/each}
            {#each annotationColors as annotationColor, i}
              {#if showLines}
                <line
                  stroke-dasharray="5,5"
                  x1={x(annotationColor)}
                  y1={y(annotationColor)}
                  x2={x(colors[i])}
                  y2={y(colors[i])}
                  stroke={annotationColor.toDisplay()}
                  stroke-width="1"
                />
              {/if}
              <circle
                {...CircleProps(annotationColor, i)}
                class="cursor-pointer"
                stroke={annotationColor.toDisplay()}
                fill={bg.toDisplay()}
                stroke-width="4"
                on:touchstart|preventDefault={(e) => {
                  onFocusedColorsChange([i]);
                  dragStart(e);
                }}
                on:touchend|preventDefault={pointMouseUp(i)}
                on:mousedown|preventDefault={pointMouseDown}
                on:mouseup|preventDefault={pointMouseUp(i)}
                on:mouseleave|preventDefault={switchToDragPoint(i)}
                on:mouseenter|preventDefault={() => hoverPoint(i)}
              />
            {/each}
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
                on:touchmove|preventDefault={(e) => dragUpdate(false)(e)}
                on:touchend|preventDefault={dragEnd(false)}
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
            on:touchend|preventDefault={selectionEnd(false)}
            on:mousemove|preventDefault={selectionUpdate(false)}
            on:mouseup|preventDefault={selectionEnd(false)}
          />
        {/if}
        {#if interactionMode === "drag"}
          <!-- selection target -->
          <rect
            {...fillParamsXY}
            on:mousemove|preventDefault={dragUpdate(false)}
            on:mouseup|preventDefault={dragEnd(false)}
            on:touchmove|preventDefault={dragUpdate(false)}
            on:touchend|preventDefault={dragEnd(false)}
          />
        {/if}
        {#if scatterPlotMode === "putting"}
          {#if puttingPreview}
            <g
              transform={config.isPolar
                ? `translate(${plotWidth / 2}, ${plotHeight / 2})`
                : ""}
            >
              <circle
                r={10}
                fill={puttingPreview.toDisplay()}
                cx={x(puttingPreview)}
                cy={y(puttingPreview)}
              />
            </g>
          {/if}
          <rect
            {...fillParamsXY}
            on:mousemove|preventDefault={puttingUpdate}
            on:touchmove|preventDefault={puttingUpdate}
            on:mouseup|preventDefault={puttingEnd}
            on:touchend|preventDefault={puttingEnd}
          />
        {/if}

        {#if typeof hoveredPoint !== "boolean" && focusedColors.length < 2}
          <g transform={`translate(0, ${height - margin.bottom})`}>
            <circle fill={hoveredPoint.toDisplay()} cx={6} cy={-7.5} r="6" />
            <text fill={textColor} x={15}>{hoveredPoint.toHex()}</text>
            <text fill={textColor} y="15">
              {hoveredPoint.toPrettyString()}
            </text>
          </g>
        {/if}
      </svg>
    </div>
  </div>
  <div class="h-full">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex h-full">
      <div class="flex flex-col">
        <svg {height} width={zWidth + margin.left + margin.right} class="mt-1">
          <ColorScatterPlotZGuide {...guideProps} {zScale} {margin} />
          <rect
            {...fillParamsZ}
            on:touchstart|preventDefault={selectionStart(true)}
            on:touchmove|preventDefault={interactionMode === "drag"
              ? dragUpdate(true)
              : selectionUpdate(true)}
            on:touchend|preventDefault={interactionMode === "drag"
              ? dragEnd(true)
              : selectionEnd(true)}
            on:mousedown|preventDefault={selectionStart(true)}
          />
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <!-- main colors -->
            {#each colors as color, i}
              {#if scatterPlotMode === "moving"}
                <rect
                  {...RectProps(color, i)}
                  stroke={computeStroke(color, i, focusSet, bg)}
                  on:mousedown|preventDefault={pointMouseDown}
                  on:mouseup|preventDefault={pointMouseUp(i)}
                  on:mouseleave|preventDefault={switchToDragPoint(i)}
                  on:touchstart|preventDefault={(e) => {
                    onFocusedColorsChange([i]);
                    dragStart(e);
                  }}
                  on:touchmove|preventDefault={dragUpdate(true)}
                  on:touchend|preventDefault={pointMouseUp(i)}
                  on:mouseenter|preventDefault={() => hoverPoint(i)}
                />
              {:else}
                <rect
                  {...RectProps(color, i)}
                  stroke={computeStroke(color, i, focusSet, bg)}
                  on:mouseenter|preventDefault={() => hoverPoint(i)}
                />
              {/if}
            {/each}
            {#each annotationColors as color, i}
              <rect
                {...RectProps(color, i)}
                width={35}
                stroke={color.toDisplay()}
                fill={"none"}
                on:mousedown|preventDefault={pointMouseDown}
                on:mouseup|preventDefault={pointMouseUp(i)}
                on:touchstart|preventDefault={(e) => {
                  onFocusedColorsChange([i]);
                  dragStart(e);
                }}
                on:touchend|preventDefault={pointMouseUp(i)}
                on:touchmove|preventDefault={dragUpdate(true)}
                on:mouseleave|preventDefault={switchToDragPoint(i)}
                on:mouseenter|preventDefault={() => hoverPoint(i)}
              />
            {/each}
            <!-- selection target -->
            {#if focusedColors.length > 0}
              <rect
                x={5}
                y={pos.zPos - 5}
                width={zWidth - 10}
                height={pos.selectionDepth + 15}
                {...outerDottedBoxStyle}
                on:touchstart|preventDefault={(e) => dragStart(e)}
                on:touchmove|preventDefault={(e) => dragUpdate(true)(e)}
                on:touchend|preventDefault={dragEnd(true)}
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
                width={zWidth - 10}
              />
            {/if}
            <!-- selection target -->
            <rect
              {...fillParamsZ}
              on:mousemove|preventDefault={selectionUpdate(true)}
              on:mouseup|preventDefault={selectionEnd(true)}
              on:touchmove|preventDefault={selectionUpdate(true)}
              on:touchend|preventDefault={selectionEnd(true)}
            />
          {/if}
          {#if interactionMode === "drag"}
            <!-- selection target -->
            <rect
              {...fillParamsZ}
              on:touchmove|preventDefault={dragUpdate(true)}
              on:mousemove|preventDefault={dragUpdate(true)}
              on:touchend|preventDefault={dragEnd(true)}
              on:mouseup|preventDefault={dragEnd(true)}
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

  svg {
    overflow: visible;
  }
</style>
