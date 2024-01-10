import { writable } from "svelte/store";
import { Color, colorFromString } from "../lib/Color";
import ColorIO from "colorjs.io";
import fits from "../assets/outfits.json";
import { pick, deDup } from "../lib/utils";
const outfitToPal = (x: any) => [x.fill1, x.fill2, x.fill3];
const outfits = fits.map((x) => outfitToPal(x));
export type PalType = "sequential" | "diverging" | "categorical";
type Pal<A> = {
  colors: A[];
  name: string;
  background: A;
  type: PalType;
  evalConfig: Record<string, any>;
};
export type Palette = Pal<Color>;

interface StoreData {
  palettes: Pal<Color>[];
  currentPal: Pal<Color>;
  engine: "openai" | "google";
}

interface StorageData {
  palettes: Pal<string>[];
  currentPal: Pal<string>;
  engine: "openai" | "google";
}

const InitialStore: StorageData = {
  palettes: [
    {
      name: "Example 1",
      colors: pick(outfits),
      background: "#ffffff",
      type: "categorical",
      evalConfig: {},
    },
    {
      name: "Example 2",
      colors: pick(outfits),
      background: "#ffffff",
      type: "categorical",
      evalConfig: {},
    },
    {
      name: "Example 3",
      colors: pick(outfits),
      background: "#ffffff",
      type: "categorical",
      evalConfig: {},
    },
  ],
  currentPal: {
    name: "Untitled",
    colors: pick(outfits),
    background: "#ffffff",
    type: "categorical",
    evalConfig: {},
  },
  engine: "google",
};

function convertStoreHexToColor(store: StorageData): StoreData {
  return {
    palettes: store.palettes.map((x) => ({
      name: x.name,
      background: colorFromString(x.background, "lab"),
      colors: x.colors.map((y) => colorFromString(y, "lab")),
      type: x.type,
      evalConfig: x.evalConfig,
    })),
    currentPal: {
      background: colorFromString(store.currentPal.background, "lab"),
      name: store.currentPal.name,
      colors: store.currentPal.colors.map((y) => colorFromString(y, "lab")),
      type: store.currentPal.type,
      evalConfig: store.currentPal.evalConfig,
    },
    engine: store.engine,
  };
}

function convertStoreColorToHex(store: StoreData): StorageData {
  return {
    palettes: store.palettes.map((x) => ({
      name: x.name,
      background: x.background.toHex(),
      colors: x.colors.map((y) => y.toHex()),
      type: x.type,
      evalConfig: x.evalConfig,
    })),
    currentPal: {
      background: store.currentPal.background.toHex(),
      name: store.currentPal.name,
      colors: store.currentPal.colors.map((y) => y.toHex()),
      type: store.currentPal.type,
      evalConfig: store.currentPal.evalConfig,
    },
    engine: store.engine,
  };
}

function insertPalette(palettes: Palette[], pal: Palette): Palette[] {
  let nameCount = palettes.reduce(
    (acc, x) => acc + (x.name === pal.name ? 1 : 0),
    0
  );
  const name = nameCount === 0 ? pal.name : `${pal.name} ${nameCount}`;
  return [...palettes, { ...pal, name }];
}

// install defaults if not present
function addDefaults(store: Partial<StoreData>): StoreData {
  const storeData = { ...store };
  // check if the base store objects work right
  Object.keys(InitialStore).forEach((key) => {
    if (!(key in storeData)) {
      storeData[key as keyof StoreData] = InitialStore[
        key as keyof StorageData
      ] as any;
    }
  });
  const palKeys = Object.keys(InitialStore.currentPal);

  // check current pal
  palKeys
    .filter((key) => !(key in storeData.currentPal!))
    .forEach((key) => {
      const palKey = key as keyof Palette;
      storeData.currentPal![palKey] = InitialStore.currentPal[palKey] as any;
    });

  // also check all of the palettes
  (storeData.palettes || []).forEach((pal) =>
    palKeys
      .filter((key) => !(key in pal))
      .forEach((key) => {
        const palKey = key as keyof Palette;
        pal[palKey] = InitialStore.currentPal[palKey] as any;
      })
  );

  return storeData as StoreData;
}

function createStore() {
  let storeData: StoreData = convertStoreHexToColor(
    JSON.parse(
      localStorage.getItem("color-pal") || JSON.stringify(InitialStore)
    )
  );
  storeData = addDefaults(storeData);

  // persist new store to storage
  localStorage.setItem(
    "color-pal",
    JSON.stringify(convertStoreColorToHex(storeData))
  );
  // create store
  const { subscribe, set, update } = writable<StoreData>(storeData);
  let undoStack: StoreData[] = [];
  let redoStack: StoreData[] = [];
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      undoStack.push(oldStore);
      redoStack = [];
      const newVal: StoreData = updateFunc(oldStore);
      localStorage.setItem(
        "color-pal",
        JSON.stringify(convertStoreColorToHex(newVal))
      );
      return newVal;
    });
  const palUp = (updateFunc: (old: Palette) => Palette) =>
    persistUpdate((n) => ({ ...n, currentPal: updateFunc(n.currentPal) }));

  const simpleUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => updateFunc(oldStore));

  const simpleSet = (key: keyof StoreData) => (val: any) =>
    persistUpdate((n) => ({ ...n, [key]: val }));

  const doSort = (comparator: (a: Color, b: Color) => number) => () =>
    palUp((n) => ({ ...n, colors: n.colors.sort(comparator) }));

  return {
    subscribe,
    undo: () =>
      simpleUpdate((currentVal) => {
        if (undoStack.length === 0) return currentVal;
        redoStack.push(currentVal);
        return undoStack.pop()!;
      }),
    redo: () =>
      simpleUpdate((currentVal) => {
        if (redoStack.length === 0) return currentVal;
        undoStack.push(currentVal);
        return redoStack.pop()!;
      }),

    setPalettes: simpleSet("palettes"),
    setCurrentPal: simpleSet("currentPal"),
    setCurrentPalColors: (colors: Color[]) => palUp((n) => ({ ...n, colors })),
    startUsingPal: (palName: string) => {
      persistUpdate((n) => {
        const newPal = n.palettes.find((x) => x.name === palName);
        if (!newPal) return n;
        const updatedPals = insertPalette(
          n.palettes.filter((x) => x.name !== palName),
          n.currentPal
        );
        return { ...n, currentPal: newPal, palettes: updatedPals };
      });
    },
    createNewPal: () =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          colors: pick(outfits).map((x: string) => colorFromString(x, "lab")),
          name: "Untitled",
          background: colorFromString("#ffffff", "lab"),
          type: "categorical",
          evalConfig: {},
        },
        palettes: insertPalette(n.palettes, n.currentPal),
      })),
    createNewPalWithExplicitPal: (newPal: Palette) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: newPal,
        palettes: insertPalette(n.palettes, n.currentPal),
      })),
    removePal: (pal: string) =>
      persistUpdate((n) => ({
        ...n,
        palettes: n.palettes.filter((x) => x.name !== pal),
      })),
    copyPal: (pal: string) =>
      persistUpdate((n) => ({
        ...n,
        palettes: insertPalette(
          n.palettes,
          n.palettes.find((x) => x.name === pal)!
        ),
      })),
    setSort: (sort: Color[]) => palUp((n) => ({ ...n, colors: deDup(sort) })),

    randomizeOrder: doSort(() => Math.random() - 0.5),
    sortByChannel: (colorSpace: string, channel: number) =>
      doSort((a, b) => {
        const aVal = new ColorIO(a.toHex()).to(colorSpace).coords[channel];
        const bVal = new ColorIO(b.toHex()).to(colorSpace).coords[channel];
        return aVal - bVal;
      })(),
    reverseSort: () => palUp((n) => ({ ...n, colors: n.colors.reverse() })),

    replaceColor: (oldColor: Color, newColor: Color) =>
      palUp((n) => ({
        ...n,
        colors: n.colors.map((x) =>
          x.toHex() === oldColor.toHex() ? newColor : x
        ),
      })),
    setCurrentPalName: (name: string) => palUp((n) => ({ ...n, name })),
    setCurrentPalType: (type: PalType) => palUp((n) => ({ ...n, type })),
    setCurrentPalEvalConfig: (evalConfig: Record<string, any>) =>
      palUp((n) => ({ ...n, evalConfig })),
    addColorToCurrentPal: (color: Color) =>
      palUp((n) => ({
        ...n,
        colors: [...n.colors, color],
      })),
    setBackground: (color: Color) =>
      palUp((n) => ({ ...n, background: color })),
    reset: () => set({ ...convertStoreHexToColor(InitialStore) }),
    setEngine: simpleSet("engine"),
  };
}

const store = createStore();

export default store;
