<script lang="ts">
  import type { Palette } from "../stores/color-store";
  import {
    Color,
    colorFromChannels,
    toColorSpace,
    colorPickerConfig,
  } from "../lib/Color";
  import { makePosAndSizes, toggleElement, clampToRange } from "../lib/utils";
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
  $: pickedColors = focusedColors.map((el) => [
    x(colors[el]),
    y(colors[el]),
    z(colors[el]),
  ]);
  $: config = colorPickerConfig[colorSpace];
  $: bg = Pal.background;
  $: colors = Pal.colors.map((x) => toColorSpace(x, colorSpace));

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
  let dragBox: false | { x: number; y: number } = false;
  let parentPos = { x: 0, y: 0 };

  const eventToColorXY = (
    e: any,
    color: Color,
    originalColor: Color
  ): Color => {
    if (!dragging || dragging.x === undefined || dragging.y === undefined)
      return color;

    const values = toXY(e);
    const screenPosDelta = {
      x: values.x - dragging.x,
      y: values.y - dragging.y,
    };

    const xClamp = (v: number) => clampToRange(v, config.xDomain);
    const yClamp = (v: number) => clampToRange(v, config.yDomain);
    // screen coordinates
    const newPos = [
      x(originalColor) + screenPosDelta.x,
      y(originalColor) + screenPosDelta.y,
    ];
    // color space coordinates
    const newVal = [
      xClamp(xInv(newPos[0], newPos[1])),
      yClamp(yInv(newPos[0], newPos[1])),
    ];
    const coords = originalColor.toChannels();
    coords[config.xChannelIndex] = newVal[0];
    coords[config.yChannelIndex] = newVal[1];
    return colorFromChannels(coords, colorSpace);
  };

  const eventToColorZ = (e: any, color: Color, originalColor: Color): Color => {
    if (!dragging || dragging.x === undefined || dragging.y === undefined)
      return color;

    const screenPosDelta = toXY(e).y - dragging.y;
    const coords = originalColor.toChannels();
    const zClamp = (v: number) => clampToRange(v, config.zDomain);
    coords[config.zChannelIndex] = zClamp(
      zInv(z(originalColor) + screenPosDelta)
    );

    return colorFromChannels(coords, colorSpace);
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
    hoveredPoint = false;
    // console.log("start drag", e.target);
    startDragging();
    const targetIsPoint = typeof idx === "number";
    let target = e.target;
    const isMetaKey = e.metaKey || e.shiftKey || e.ctrlKey;
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

    // check if selected in screen space
    const newFocusedColors = colors
      .map((color, idx) => {
        let [xVal, yVal] = [x(color), y(color)];
        if (config.isPolar) {
          xVal += plotWidth / 2;
          yVal += plotHeight / 2;
        }
        const inXBound = xMin <= xVal && xVal <= xMax;
        const inYBound = yMin <= yVal && yVal <= yMax;
        return inXBound && inYBound ? idx : -1;
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
        const y = z(color);
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
  // coordinate transforms
  // color space -> screen
  type Channels = [number, number, number];
  // slight indirection to make these mappings more re-usable
  $: xPre = config.isPolar
    ? (coords: Channels) => {
        const r = rScale(coords[config.xChannelIndex]);
        const theta = angleScale(coords[config.yChannelIndex]);
        return r * Math.cos(theta);
      }
    : (coords: Channels) => xScale(coords[config.xChannelIndex]);
  $: yPre = config.isPolar
    ? (coords: Channels) => {
        const r = rScale(coords[config.xChannelIndex]);
        const theta = angleScale(coords[config.yChannelIndex]);
        return r * Math.sin(theta);
      }
    : (coords: Channels) => yScale(coords[config.yChannelIndex]);
  $: zPre = (coords: Channels) => zScale(coords[config.zChannelIndex]);
  $: x = (color: Color) => xPre(color.toChannels());
  $: y = (color: Color) => yPre(color.toChannels());
  $: z = (color: Color) => zPre(color.toChannels());
  // screen -> color space
  $: xInv = config.isPolar
    ? (x: number, y: number) => rScale.invert(Math.sqrt(x * x + y * y))
    : (x: number) => xScale.invert(x);
  $: yInv = config.isPolar
    ? (x: number, y: number) => {
        const angle = angleScale.invert(Math.atan2(y, x)) % 360;
        return angle < 0 ? angle + 360 : angle;
      }
    : (x: number, y: number) => yScale.invert(y);
  $: zInv = (z: number) => zScale.invert(z);

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
  $: guideProps = {
    xScale,
    yScale,
    plotHeight,
    plotWidth,
    axisColor,
    textColor,
    colorSpace,
    dragging: !!dragging,
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
      <svg
        {width}
        {height}
        class="ml-2"
        on:mouseleave={stopDrag}
        on:mouseup={stopDrag}
        on:touchend={stopDrag}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {#if config.isPolar}
            <ColorScatterPlotPolarGuide {...guideProps} {rScale} />
          {:else}
            <ColorScatterPlotXyGuides {...guideProps} />
          {/if}

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

          <g
            transform={config.isPolar
              ? `translate(${plotWidth / 2}, ${plotHeight / 2})`
              : ""}
          >
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
                  on:mouseenter={() => hoverPoint(color)}
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
            {#if hoveredPoint}
              <g
                transform={`translate(${x(hoveredPoint) + 5}, ${
                  y(hoveredPoint) - 5
                })`}
              >
                <text fill={textColor}>{hoveredPoint.toDisplay()}</text>
              </g>
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
        </g>
      </svg>
    </div>
  </div>
  <div class="h-full">
    <!-- invisible space inserter -->
    <span class=" text-xl opacity-0">X</span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex h-full">
      <div class="flex flex-col">
        <svg
          {height}
          width={80 + margin.left + margin.right}
          class="mt-1"
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
            {margin}
          />
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <rect
              x={0}
              y={-20}
              width={80}
              height={yScale.range()[1] + 40}
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
            {#if pickedColors.length && focusedColors.length > 1}
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

  /* svg {
    overflow: visible;
  } */
</style>
