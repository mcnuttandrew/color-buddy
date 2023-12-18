import * as vega from "vega";
import * as vegaLite from "vega-lite";
import type { Palette } from "../stores/color-store";

export const idxToKey = (idx: number) => `#${idx}A${idx}0${idx}${idx}`;

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
      // ordinal: ordinalPalette,
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
    url: "./penguins.json",
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
  width: 500,
  height: 200,
  autosize: "none",
  data: [
    {
      name: "counties",
      url: "./us-10m.json",
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
  projections: [{ name: "projection", type: "albersUsa" }],

  scales: [
    {
      name: "color",
      type: "ordinal",
      domain: { data: "counties", field: "mod" },
      range: pal.colors.map((_x, idx) => idxToKey(idx)),
      // range: pal.colors.map((x) => x.toHex()),
    },
  ],

  marks: [
    {
      type: "shape",
      from: { data: "counties" },
      encode: {
        update: { fill: { scale: "color", field: "mod" } },
        hover: { fill: { value: "red" } },
      },
      transform: [{ type: "geoshape", projection: "projection" }],
    },
  ],
});

const areaChart = (pal: Palette) => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 400,
  height: 80,
  data: { url: "penguins.json" },
  mark: { type: "area", opacity: 0.5 },
  transform: [
    {
      density: "Body Mass (g)",
      groupby: ["Species"],
      extent: [2500, 6500],
    },
  ],
  encoding: {
    x: { field: "value", type: "quantitative", title: "Body Mass (g)" },
    y: { field: "density", type: "quantitative", stack: null },
    color: { field: "Species", type: "nominal" },
  },
});

export const charts = [
  groupedBarChart, //
  scatterPlot,
  map,
  areaChart,
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
    results[newKey] = x;
    return x;
  });
}
