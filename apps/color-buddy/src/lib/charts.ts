import type { Palette } from "@color-buddy/palette-lint";
import * as vega from "vega";
import * as vegaLite from "vega-lite";

export const idxToKey = (idx: number) => `#${idx}A${idx}0${idx}${idx}`;

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
