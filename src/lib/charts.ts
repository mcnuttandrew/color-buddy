import * as vega from "vega";
import * as vegaLite from "vega-lite";
import type { Palette } from "../stores/color-store";

export const idxToKey = (idx: number) => `#${idx}A${idx}0${idx}${idx}`;

export const VegaColors = {
  category10: "1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf",
  category20:
    "1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5",
  category20b:
    "393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6",
  category20c:
    "3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9",
  tableau10: "4c78a8f58518e4575672b7b254a24beeca3bb279a2ff9da69d755dbab0ac",
  tableau20:
    "4c78a89ecae9f58518ffbf7954a24b88d27ab79a20f2cf5b43989483bcb6e45756ff9d9879706ebab0acd67195fcbfd2b279a2d6a5c99e765fd8b5a5",
  accent: "7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666",
  dark2: "1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666",
  paired:
    "a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928",
  pastel1: "fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2",
  pastel2: "b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc",
  set1: "e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999",
  set2: "66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3",
  set3: "8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f",
};

export function buildTheme(pal: Palette): any {
  // const colors = pal.colors.map((x) => x.toHex());
  const colors = pal.colors.map((_x, idx) => idxToKey(idx));

  const fontStandard = "Montserrat, sans-serif UI";
  const fontTitle = "wf_standard-font, helvetica, arial, sans-serif";
  const basicColor =
    pal.background.toChroma().luminance() > 0.5 ? "#000000" : "#ffffff";
  // const secondLevelElementColor = "#605E5C";
  // const backgroundColor = pal.background.toHex();
  const backgroundColor = "SaLmOn";
  // const backgroundSecondaryColor = "#C8C6C4";

  return {
    view: { stroke: backgroundColor },
    background: backgroundColor,
    font: fontStandard,
    header: {
      titleFont: fontTitle,
      // titleFontSize: fontLargePx,
      titleColor: basicColor,
      labelFont: fontStandard,
      // labelFontSize: legendFontPx,
      labelColor: basicColor,
    },
    axis: {
      ticks: false,
      grid: false,
      domain: false,
      labelColor: basicColor,
      // labelFontSize: fontSmallPx,
      titleFont: fontTitle,
      titleColor: basicColor,
      // titleFontSize: fontLargePx,
      titleFontWeight: "normal",
    },
    axisQuantitative: {
      tickCount: 3,
      grid: true,
      gridColor: basicColor,
      gridDash: [1, 5],
      labelFlush: false,
    },
    axisBand: { tickExtra: true },
    axisX: { labelPadding: 5 },
    axisY: { labelPadding: 10 },
    bar: { fill: colors[0] },
    line: {
      stroke: colors[0],
      strokeWidth: 3,
      strokeCap: "round",
      strokeJoin: "round",
    },
    text: {
      font: fontStandard,
      // fontSize: fontSmallPx,
      fill: basicColor,
    },
    arc: { fill: colors[0] },
    area: { fill: colors[0], line: true, opacity: 0.6 },
    path: { stroke: colors[0] },
    rect: { fill: colors[0] },
    point: { fill: colors[0], filled: true, size: 75 },
    shape: { stroke: colors[0] },
    symbol: { fill: colors[0], strokeWidth: 1.5, size: 50 },
    legend: {
      titleFont: fontStandard,
      titleFontWeight: "bold",
      titleColor: basicColor,
      labelFont: fontStandard,
      // labelFontSize: legendFontPx,
      labelColor: basicColor,
      symbolType: "circle",
      symbolSize: 75,
    },
    range: {
      category: colors,
      // diverging: divergentPalette,
      // heatmap: divergentPalette,
      ordinal: colors,
    },
  };
}

const groupedBarChart = (_pal: Palette) => ({
  height: 150,
  width: 150,
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    values: [
      { category: "A", group: "x", value: 0.1 },
      { category: "A", group: "y", value: 0.6 },
      { category: "A", group: "z", value: 0.9 },
      { category: "B", group: "x", value: 0.7 },
      { category: "B", group: "y", value: 0.2 },
      { category: "B", group: "z", value: 1.1 },
      { category: "C", group: "x", value: 0.6 },
      { category: "C", group: "y", value: 0.1 },
      { category: "C", group: "z", value: 0.2 },
    ],
  },
  mark: "bar",
  encoding: {
    x: { field: "category" },
    y: { field: "value", type: "quantitative" },
    xOffset: { field: "group" },
    color: { field: "group" },
  },
});
const scatterPlot = (_pal: Palette) => ({
  height: 150,
  width: 150,
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description:
    "A scatterplot showing body mass and flipper lengths of penguins.",
  data: {
    url: !location.href.includes("localhost")
      ? "https://vega.github.io/editor/data/penguins.json"
      : "data/penguins.json",
  },
  mark: "point",
  encoding: {
    x: {
      field: "Flipper Length (mm)",
      type: "quantitative",
      scale: { zero: false },
    },
    y: {
      field: "Body Mass (g)",
      type: "quantitative",
      scale: { zero: false },
    },
    color: { field: "Species", type: "nominal" },
    shape: { field: "Species", type: "nominal" },
  },
});

const map = (pal: Palette) => ({
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: 250,
  height: 250,
  autosize: "none",
  data: [
    {
      name: "counties",
      url: !location.href.includes("localhost")
        ? "https://vega.github.io/editor/data/us-10m.json"
        : "data/us-10m.json",
      format: { type: "topojson", feature: "counties" },
      transform: [
        {
          type: "formula",
          expr: `datum.id - (parseInt(datum.id/${pal.colors.length + 5}) * ${
            pal.colors.length
          })`,
          as: "mod",
        },
      ],
    },
  ],
  projections: [
    { name: "projection", type: "albersUsa", translate: [0, 400], scale: 2900 },
  ],

  scales: [
    {
      name: "color",
      type: "ordinal",
      domain: { data: "counties", field: "mod" },
      range: pal.colors.map((_x, idx) => idxToKey(idx)),
    },
  ],

  marks: [
    {
      type: "shape",
      from: { data: "counties" },
      encode: {
        update: { fill: { scale: "color", field: "mod" } },
      },
      transform: [{ type: "geoshape", projection: "projection" }],
    },
  ],
});

const areaChart = (pal: Palette) => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 250,
  height: 200,
  data: {
    url: !location.href.includes("localhost")
      ? "https://vega.github.io/editor/data/penguins.json"
      : "data/penguins.json",
  },
  mark: { type: "area", opacity: 0.5 },
  transform: [
    { density: "Body Mass (g)", groupby: ["Species"], extent: [2500, 6500] },
  ],
  encoding: {
    x: { field: "value", type: "quantitative", title: "Body Mass (g)" },
    y: { field: "density", type: "quantitative", stack: null },
    color: { field: "Species", type: "nominal" },
  },
});

const stackedAreaChart = (pal: Palette) => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    url: !location.href.includes("localhost")
      ? "https://vega.github.io/editor/data/barley.json"
      : "data/barley.json",
  },
  mark: "bar",
  encoding: {
    x: { field: "yield", type: "quantitative", aggregate: "sum" },
    y: { field: "variety", type: "nominal" },
    color: { field: "site", type: "nominal" },
  },
});

const scatterPlotOrdinal = (_pal: Palette) => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    url: !location.href.includes("localhost")
      ? "https://vega.github.io/editor/data/penguins.json"
      : "data/penguins.json",
  },
  mark: "point",
  encoding: {
    x: {
      field: "Flipper Length (mm)",
      type: "quantitative",
      scale: { zero: false },
    },
    y: {
      field: "Body Mass (g)",
      type: "quantitative",
      scale: { zero: false },
    },
    color: { field: "Flipper Length (mm)", type: "ordinal", legend: null },
    shape: { field: "Species", type: "nominal" },
  },
});

const heatmap = (_pal: Palette) => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    values: [
      { x: 0, y: 0, value: -10 },
      { x: 1, y: 0, value: -5 },
      { x: 2, y: 0, value: 0 },
      { x: 3, y: 0, value: 5 },
      { x: 0, y: 1, value: -5 },
      { x: 1, y: 1, value: 0 },
      { x: 2, y: 1, value: 5 },
      { x: 3, y: 1, value: 10 },
      { x: 0, y: 2, value: 0 },
      { x: 1, y: 2, value: 5 },
      { x: 2, y: 2, value: 10 },
      { x: 3, y: 2, value: 15 },
    ],
  },
  mark: "rect",
  encoding: {
    x: { field: "x", type: "ordinal" },
    y: { field: "y", type: "ordinal" },
    color: { field: "value", type: "ordinal", bin: true },
  },
});

export const charts = [
  // groupedBarChart, //
  // { group: "categorical", chart: scatterPlot },
  { group: "categorical", chart: map },
  { group: "categorical", chart: areaChart },
  { group: "categorical", chart: stackedAreaChart },
  { group: "ordinal", chart: scatterPlotOrdinal },
  { group: "ordinal", chart: heatmap },
];

const results: Record<string, string> = {};
export async function getSVG(localSpec: any, pal: Palette) {
  const newKey =
    pal.colors.length + pal.background.toHex() + JSON.stringify(localSpec);
  if (results[newKey]) return results[newKey];
  const theme = buildTheme(pal);
  let spec = localSpec;
  if (spec.$schema.includes("vega-lite")) {
    spec = vegaLite.compile(spec, { config: theme }).spec;
  }
  const runtime = vega.parse(spec, theme);
  const view = await new vega.View(runtime, { renderer: "svg" }).runAsync();
  return await view.toSVG().then((x) => {
    const newSvg = x;
    // .replace("<svg", `<svg overflow="visible" `);
    results[newKey] = newSvg;
    return newSvg;
  });
}
