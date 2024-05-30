import { writable } from "svelte/store";
import * as idb from "idb-keyval";
import { idxToKey } from "../lib/charts";

type Example =
  | { svg: string; hidden?: boolean; size?: number; name: string }
  | { vega: string; hidden?: boolean; size?: number; name: string };
interface StoreData {
  examples: Example[];
}

const InitialStore: StoreData = {
  examples: [],
};

export const DEMOS = [
  { type: "svg", title: "Albers", filename: "./examples/albers.svg" },
  { type: "svg", title: "Holy Grail", filename: "./examples/HolyGrail.svg" },
  { type: "svg", title: "Fourier", filename: "./examples/fourier.svg" },
  { type: "svg", title: "Mondrian", filename: "./examples/mondrian.svg" },
  { type: "svg", title: "Vis Logo", filename: "./examples/vis-logo.svg" },
  {
    type: "vega",
    title: "Area Chart",
    filename: "./examples/area-chart.json",
  },
  {
    type: "vega",
    title: "Bar Chart",
    filename: "./examples/grouped-bar-chart.json",
  },
  { type: "vega", title: "Heatmap", filename: "./examples/heatmap.json" },
  { type: "vega", title: "Map", filename: "./examples/illinois-map.json" },
  {
    type: "vega",
    title: "Scatterplot",
    filename: "./examples/scatterplot-ordinal.json",
  },
  // {
  //   type: "vega",
  //   title: "Scatterplot",
  //   filename: "./examples/scatterplot.json",
  // },
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
  {
    type: "vega",
    title: "Grid",
    filename: "./examples/grid-heatmap.json",
  },
  {
    type: "vega",
    title: "Circle Pack",
    filename: "./examples/colorpack.json",
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
      const example = { hidden: false, size: 250, name: demo.title } as any;
      if (demo.type === "vega") {
        example.vega = text;
      } else {
        const colors = detectColorsInSvgString(text);
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

  idb.get(storeName).then(async (x) => {
    const prebuiltExamples = await buildAllExamples();
    const preBuiltMap = prebuiltExamples.reduce((acc, cur) => {
      acc[cur.name] = cur;
      return acc;
    }, {} as any);
    if (x) {
      const examples = x.examples.filter((x: any) => !preBuiltMap[x.name]);
      const newStore = { examples: [...prebuiltExamples, ...examples] };
      set(newStore as StoreData);
    } else {
      set({ ...InitialStore, examples: prebuiltExamples });
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
        const nameCollisions = old.examples.filter((x) =>
          x.name.startsWith(example.name)
        );
        if (nameCollisions.length) {
          example.name = `${example.name}-${nameCollisions.length + 1}`;
        }

        return { ...old, examples: [...old.examples, example] };
      }),
    restoreDefaultExamples: async () => {
      const examples = await buildAllExamples();
      persistUpdate((old) => ({ ...old, examples }));
    },
    restoreHiddenExample: (idx: number) =>
      persistUpdate((old) => {
        const newExamples = [...old.examples];
        newExamples[idx].hidden = false;
        return { ...old, examples: newExamples };
      }),
    restoreHiddenExamples: () =>
      persistUpdate((old) => ({
        ...old,
        examples: old.examples.map((x) => ({ ...x, hidden: false, size: 250 })),
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
        };
      }),
    duplicateExample: (idx: number) =>
      persistUpdate((old) => {
        const newExamples = [...old.examples];
        const example = JSON.parse(JSON.stringify(newExamples[idx]));
        example.name = `${example.name} (copy)`;
        newExamples.splice(idx + 1, 0, example);
        return {
          ...old,
          examples: newExamples,
        };
      }),
    onlySwatches: () =>
      persistUpdate((old) => {
        return { ...old, examples: hideAllExamples(old.examples) };
      }),
    setExampleSize: (idx: number, size: number) =>
      persistUpdate((old) => {
        const newExamples = [...old.examples];
        newExamples[idx].size = size;
        return { ...old, examples: newExamples };
      }),
    setExampleName: (idx: number, name: string) =>
      persistUpdate((old) => {
        const newExamples = [...old.examples];
        newExamples[idx].name = name;
        return { ...old, examples: newExamples };
      }),
    hideAllExcept: (idx: number) =>
      persistUpdate((old) => {
        const newExamples = hideAllExamples(old.examples);
        newExamples[idx].hidden = false;

        return {
          ...old,
          examples: newExamples,
        };
      }),
  };
}

const hideAllExamples = (examples: Example[]) =>
  examples.map((example) => ({ ...example, hidden: true }));

const store = createStore();

export default store;
