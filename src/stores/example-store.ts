import { writable } from "svelte/store";
import * as idb from "idb-keyval";
import { idxToKey } from "../lib/charts";

type Example =
  | { svg: string; hidden?: boolean }
  | { vega: string; hidden?: boolean };
interface StoreData {
  examples: Example[];
  sections: typeof InitialSections;
}
const InitialSections = {
  svg: true,
  vega: true,
  swatches: true,
};
const InitialStore: StoreData = {
  examples: [],
  sections: InitialSections,
};

export const DEMOS = [
  { type: "svg", title: "Albers", filename: "./examples/albers.svg" },
  { type: "svg", title: "Holy Grail", filename: "./examples/HolyGrail.svg" },
  { type: "svg", title: "Fourier", filename: "./examples/fourier.svg" },
  { type: "svg", title: "Mondrian", filename: "./examples/mondrian.svg" },
  { type: "svg", title: "R Squared", filename: "./examples/r2.svg" },
  { type: "svg", title: "Vis Logo", filename: "./examples/vis-logo.svg" },
  {
    type: "vega",
    title: "Area Chart",
    filename: "./examples/area-chart.json",
  },
  {
    type: "vega",
    title: "Grouped Bar Chart",
    filename: "./examples/grouped-bar-chart.json",
  },
  { type: "vega", title: "Heatmap", filename: "./examples/heatmap.json" },
  { type: "vega", title: "Map", filename: "./examples/illinois-map.json" },
  {
    type: "vega",
    title: "Scatterplot Ordinal",
    filename: "./examples/scatterplot-ordinal.json",
  },
  {
    type: "vega",
    title: "Scatterplot",
    filename: "./examples/scatterplot.json",
  },
  {
    type: "vega",
    title: "Stacked Area Chart",
    filename: "./examples/stacked-area-chart.json",
  },
  {
    type: "vega",
    title: "Line Chart",
    filename: "./examples/line-chart.json",
  },
];

export function modifySVGForExampleStore(
  svgString: string,
  targetedColors: string[]
) {
  let svg = svgString;
  targetedColors.forEach((color, idx) => {
    svg = svg.split(color).join(idxToKey(idx));
  });
  // remove anything like clip-path="url()"
  svg = svg.replace(/clip-path="url\(.*?\)"/g, "");
  // remove anything like <?xml version="1.0" encoding="UTF-8"?>
  svg = svg.replace(/<\?xml.*?>/g, "");
  return svg;
}

export function detectColorsInSvgString(svgString: string) {
  const colors = new Set<string>();
  //  match hex or rgb(255, 255, 255)
  const regex = /#(?:[0-9a-fA-F]{3}){1,2}|rgb\((?:\d{1,3},\s*){2}\d{1,3}\)/g;

  let match;
  while ((match = regex.exec(svgString))) {
    colors.add(match[0]);
  }
  return Array.from(colors);
}

async function buildAllExamples() {
  const builtExamples = [];
  for (const demo of DEMOS) {
    try {
      const text = await fetch(demo.filename).then((x) => x.text());
      const example = { hidden: false } as any;
      if (demo.type === "vega") {
        example.vega = text;
      } else {
        const colors = detectColorsInSvgString(text);
        store.addExample(example);
        example.svg = modifySVGForExampleStore(text, colors);
      }
      builtExamples.push(example);
    } catch (e) {
      console.error("Failed to load example", demo, e);
      continue;
    }
  }
  return builtExamples;
}

const storeName = "color-pal-examples";
function createStore() {
  let storeData: StoreData = JSON.parse(JSON.stringify(InitialStore));

  const { subscribe, set, update } = writable<StoreData>(storeData);
  idb.get(storeName).then((x) => {
    if (x) {
      const savedSections = Object.fromEntries(
        Object.entries(InitialStore.sections).map(([key, value]) => [
          key,
          (x.sections || {})[key] || value,
        ])
      );
      const newStore = {
        examples: x.examples || [],
        sections: savedSections,
      };
      set(newStore as StoreData);
    } else {
      buildAllExamples().then((examples) => {
        set({ ...InitialStore, examples });
      });
    }
  });
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      idb.set(storeName, newVal);
      return newVal;
    });

  return {
    subscribe,
    set: (newStore: StoreData) => persistUpdate(() => newStore),
    reset: () => persistUpdate(() => ({ ...InitialStore })),
    toggleSection: (section: keyof typeof InitialSections) =>
      persistUpdate((old) => ({
        ...old,
        sections: { ...old.sections, [section]: !old.sections[section] },
      })),
    updateExample: (example: Example, idx: number) =>
      persistUpdate((old) => {
        const newExamples = [...old.examples];
        newExamples[idx] = example;
        return { ...old, examples: newExamples };
      }),
    deleteExample: (idx: number) =>
      persistUpdate((old) => ({
        ...old,
        examples: [...old.examples].filter((_, i) => i !== idx),
      })),
    addExample: (example: Example) =>
      persistUpdate((old) => {
        return { ...old, examples: [...old.examples, example] };
      }),
    restoreDefaultExamples: async () => {
      const examples = await buildAllExamples();
      persistUpdate((old) => ({ ...old, examples }));
    },
    restoreHiddenExamples: () =>
      persistUpdate((old) => ({
        ...old,
        sections: Object.fromEntries(
          Object.keys(old.sections).map((x) => [x, true])
        ) as any,
        examples: old.examples.map((x) => ({ ...x, hidden: false })),
      })),
    toggleHidden: (idx: number) =>
      persistUpdate((old) => {
        const newExamples = [...old.examples];
        newExamples[idx].hidden = !newExamples[idx].hidden;
        return { ...old, examples: newExamples };
      }),
    soloExample: (idx: number) =>
      persistUpdate((old) => {
        const newExamples = hideAllExamples(old.examples);
        newExamples[idx].hidden = false;
        return {
          ...old,
          examples: newExamples,
          sections: { ...old.sections, swatches: false },
        };
      }),
    onlySwatches: () =>
      persistUpdate((old) => {
        return { ...old, examples: hideAllExamples(old.examples) };
      }),
  };
}

const hideAllExamples = (examples: Example[]) =>
  examples.map((example) => ({ ...example, hidden: true }));

const store = createStore();

export default store;
