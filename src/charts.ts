export function buildTheme(colors: string[]) {
  const fontStandard = "Montserrat, sans-serif UI";
  const fontTitle = "wf_standard-font, helvetica, arial, sans-serif";
  const firstLevelElementColor = "#252423";
  const secondLevelElementColor = "#605E5C";
  const backgroundColor = "transparent";
  const backgroundSecondaryColor = "#C8C6C4";

  return {
    view: { stroke: backgroundColor },
    background: backgroundColor,
    font: fontStandard,
    header: {
      titleFont: fontTitle,
      // titleFontSize: fontLargePx,
      titleColor: firstLevelElementColor,
      labelFont: fontStandard,
      // labelFontSize: legendFontPx,
      labelColor: secondLevelElementColor,
    },
    axis: {
      ticks: false,
      grid: false,
      domain: false,
      labelColor: secondLevelElementColor,
      // labelFontSize: fontSmallPx,
      titleFont: fontTitle,
      titleColor: firstLevelElementColor,
      // titleFontSize: fontLargePx,
      titleFontWeight: "normal",
    },
    axisQuantitative: {
      tickCount: 3,
      grid: true,
      gridColor: backgroundSecondaryColor,
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
      fill: secondLevelElementColor,
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
      titleColor: secondLevelElementColor,
      labelFont: fontStandard,
      // labelFontSize: legendFontPx,
      labelColor: secondLevelElementColor,
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

const groupedBarChart = {
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
};
const scatterPlot = {
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
};
export const charts = [groupedBarChart, scatterPlot];
