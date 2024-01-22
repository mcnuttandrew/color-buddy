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
  const basicColor = pal.background.luminance() > 0.5 ? "#000000" : "#ffffff";
  // const secondLevelElementColor = "#605E5C";
  // const backgroundColor = pal.background.toHex();
  const backgroundColor = "rebekkablue";
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

const vegaDatasets = [
  "7zip.png",
  "airports.csv",
  "annual-precip.json",
  "anscombe.json",
  "barley.json",
  "birdstrikes.csv",
  "budget.json",
  "budgets.json",
  "burtin.json",
  "cars.json",
  "co2-concentration.csv",
  "countries.json",
  "crimea.json",
  "disasters.csv",
  "driving.json",
  "earthquakes.json",
  "ffox.png",
  "flare-dependencies.json",
  "flare.json",
  "flights-10k.json",
  "flights-200k.arrow",
  "flights-200k.json",
  "flights-20k.json",
  "flights-2k.json",
  "flights-3m.csv",
  "flights-5k.json",
  "flights-airport.csv",
  "football.json",
  "gapminder-health-income.csv",
  "gapminder.json",
  "gimp.png",
  "github.csv",
  "income.json",
  "iowa-electricity.csv",
  "jobs.json",
  "la-riots.csv",
  "londonBoroughs.json",
  "londonCentroids.json",
  "londonTubeLines.json",
  "lookup_groups.csv",
  "lookup_people.csv",
  "miserables.json",
  "monarchs.json",
  "movies.json",
  "normal-2d.json",
  "obesity.json",
  "ohlc.json",
  "penguins.json",
  "platformer-terrain.json",
  "points.json",
  "political-contributions.json",
  "population.json",
  "population_engineers_hurricanes.csv",
  "seattle-weather-hourly-normals.csv",
  "seattle-weather.csv",
  "sp500-2000.csv",
  "sp500.csv",
  "stocks.csv",
  "udistrict.json",
  "unemployment-across-industries.json",
  "unemployment.tsv",
  "uniform-2d.json",
  "us-10m.json",
  "us-employment.csv",
  "us-state-capitals.json",
  "volcano.json",
  "weather.csv",
  "weather.json",
  "wheat.json",
  "windvectors.csv",
  "world-110m.json",
  "zipcodes.csv",
];

const results: Record<string, string> = {};
export async function getSVG(localSpec: string, pal: Palette) {
  const newKey =
    pal.colors.length + pal.background.toHex() + JSON.stringify(localSpec);
  if (results[newKey]) return results[newKey];
  const theme = buildTheme(pal);
  let spec: any;

  const cleanSpec = vegaDatasets.reduce((acc, x) => {
    const breakKey = `url": "data/${x}`;
    const joinKey = `url": "https://vega.github.io/editor/data/${x}`;
    return acc.split(breakKey).join(joinKey);
  }, localSpec);

  try {
    spec = JSON.parse(cleanSpec);
  } catch (e) {
    console.error(e, cleanSpec);
    return "";
  }
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
