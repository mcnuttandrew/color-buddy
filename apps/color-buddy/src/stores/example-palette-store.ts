import { writable } from "svelte/store";
import * as idb from "idb-keyval";
import { Color, utils } from "@color-buddy/palette-lint";
import type { Palette, LintResult } from "@color-buddy/palette-lint";

export interface PaletteWrap {
  palette: Palette;
  lints: LintResult[];
}

interface StoreData {
  palettes: PaletteWrap[];
}

const InitialStore: StoreData = {
  palettes: [],
};

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
  set1: "e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999",
};

const colorStringToHex = (x: string) => {
  let idx = 0;
  const colors = [];
  while (idx < x.length) {
    colors.push(`#${x.slice(idx, idx + 6)}`);
    idx += 6;
  }
  return colors;
};

export const makePal = (
  name: string,
  colors: string[],
  colorSpace: any,
  type: any = "categorical"
) => {
  const pal = utils.makePalFromString(colors);
  pal.colors = pal.colors.map((x) => {
    x.color = x.color.toColorSpace(colorSpace);
    return x;
  });
  return {
    ...pal,
    name,
    background: Color.colorFromString("#ffffff", colorSpace),
    type,
  };
};

async function buildAllExamples(): Promise<PaletteWrap[]> {
  const newPals: Palette[] = [];
  Object.entries(VegaColors).forEach(([name, colors]) => {
    newPals.push(makePal(name, colorStringToHex(colors), "lab"));
  });

  const get = (url: string) => fetch(url).then((x) => x.json());
  const pals = await get("./pal-sets.json");
  (Object.entries(pals) as any[]).forEach(([name, { type, colors }]) => {
    newPals.push(makePal(name, colors, "lab", type));
  });

  const outfits = await get("./outfits.json");
  outfits.forEach((x: any) => {
    const colors = [x.fill1, x.fill2, x.fill3] as string[];
    const pal = makePal(x.name, colors, "lab", "categorical");
    newPals.push(pal);
  });

  const tableauColors = await get("./tableau-colors.json");
  tableauColors.forEach((x: any) => {
    newPals.push(makePal(x.name, x.colors, "lab", x.type));
  });
  return newPals.map((x) => ({ palette: x, lints: [] }));
}

const storeName = "color-buddy-example-palettes";

function serializeStore(store: StoreData) {
  const outputStore = { ...store } as any;
  outputStore.palettes = outputStore.palettes.map((x: any) => {
    const palette = x.palette;
    return {
      palette: {
        ...palette,
        colors: palette.colors.map((x: any) => x.toString()),
        background: palette.background.toString(),
      },
      lints: [...x.lints],
    };
  });
  return outputStore;
}
function deserializeStore(oldStore: any): StoreData {
  const store = { ...oldStore };
  store.palettes = store.palettes.map((x: any) => {
    const palette = x.palette;
    return {
      palette: {
        ...palette,
        colors: palette.colors.map((x: string) =>
          Color.colorFromString(x, palette.colorSpace)
        ),
        background: Color.colorFromString(
          palette.background,
          palette.colorSpace
        ),
      },
      lints: x.lints,
    };
  });
  return store;
}

function createStore() {
  let storeData: StoreData = JSON.parse(JSON.stringify(InitialStore));

  const { subscribe, set, update } = writable<StoreData>(storeData);

  idb.get(storeName).then(async (x) => {
    if (x) {
      set(deserializeStore(x));
    } else {
      const prebuiltExamples = await buildAllExamples();
      set({ ...InitialStore, palettes: prebuiltExamples });
    }
  });
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      idb.set(storeName, serializeStore(newVal));
      return newVal;
    });

  return {
    subscribe,
    set: (newStore: StoreData) => persistUpdate(() => newStore),
    reset: () => persistUpdate(() => ({ ...InitialStore })),
    postLint: (idx: number, lints: LintResult[]) =>
      persistUpdate((old) => {
        const newPals = [...old.palettes];
        newPals[idx] = { ...newPals[idx], lints };
        return { ...old, palettes: newPals };
      }),
  };
}

const store = createStore();
export default store;
