import { writable } from "svelte/store";
import { Color } from "../lib/Color";
import fits from "../assets/outfits.json";
import { pick, deDup } from "../lib/utils";
const outfitToPal = (x: any) => [x.fill1, x.fill2, x.fill3];
const outfits = fits.map((x) => outfitToPal(x));
export type PalType = "sequential" | "diverging" | "categorical";
type ColorSpace =
  | "lab"
  | "hsl"
  | "hsv"
  | "jzazbz"
  | "lch"
  | "oklab"
  | "oklch"
  | "rgb"
  | "srgb";
type Pal<A> = {
  background: A;
  colorSpace: ColorSpace;
  colors: A[];
  evalConfig: Record<string, any>;
  name: string;
  type: PalType;
};
export type Palette = Pal<Color>;
export type StringPalette = Pal<string>;

interface StoreData {
  palettes: Pal<Color>[];
  currentPal: number;
}

interface StorageData {
  palettes: Pal<string>[];
  currentPal: number;
}

export function newGenericPal(name: string): Pal<string> {
  return {
    name,
    colors: pick(outfits),
    background: "#ffffff",
    type: "categorical",
    evalConfig: {},
    colorSpace: "lab",
  };
}

function stringPalToColorPal(pal: Pal<string>): Pal<Color> {
  return {
    ...pal,
    background: Color.colorFromString(pal.background, pal.colorSpace),
    colors: pal.colors.map((x) => Color.colorFromString(x, pal.colorSpace)),
  };
}

const InitialStore: StorageData = {
  palettes: [
    newGenericPal("Example 1"),
    newGenericPal("Example 2"),
    newGenericPal("Example 3"),
  ],
  currentPal: 0,
};

function convertStoreHexToColor(store: StorageData): StoreData {
  return {
    palettes: store.palettes.map(stringPalToColorPal),
    currentPal: store.currentPal,
  };
}

function convertStoreColorToHex(store: StoreData): StorageData {
  return {
    palettes: store.palettes.map((x) => ({
      ...x,
      background: x.background.toString(),
      colors: x.colors.map((y) => y.toString()),
    })),
    currentPal: store.currentPal,
  };
}

// install defaults if not present
function addDefaults(store: Partial<StorageData>): StorageData {
  // check if the base store objects work right
  const storeData = { ...InitialStore, ...store };

  // also check all of the palettes
  const genericPal = newGenericPal("Example");
  storeData.palettes = storeData.palettes!.map((pal) => ({
    ...genericPal,
    ...pal,
  }));

  return storeData as StorageData;
}

function createStore() {
  const target =
    localStorage.getItem("color-pal") || JSON.stringify(InitialStore);
  let storeData: StoreData = convertStoreHexToColor(
    addDefaults(JSON.parse(target))
  );

  // persist new store to storage
  localStorage.setItem(
    "color-pal",
    JSON.stringify(convertStoreColorToHex(storeData))
  );
  // create store
  const { subscribe, set, update } = writable<StoreData>(storeData);
  let undoStack: StoreData[] = [];
  let redoStack: StoreData[] = [];
  // special logic to enable not capturing too many steps via dragging
  let pausePersistance = false;
  let lastStore: StoreData = storeData;
  const save = (store: StoreData) =>
    localStorage.setItem(
      "color-pal",
      JSON.stringify(convertStoreColorToHex(store))
    );
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      if (pausePersistance) {
        lastStore = oldStore;
        return updateFunc(oldStore);
      }
      undoStack.push(oldStore);
      redoStack = [];
      const newVal: StoreData = updateFunc(oldStore);
      save(newVal);
      return newVal;
    });
  const palUp = (updateFunc: (old: Palette) => Palette) =>
    persistUpdate((n) => {
      const newPal = updateFunc(n.palettes[n.currentPal]);
      const updatedPals = [...n.palettes];
      updatedPals[n.currentPal] = newPal;
      return { ...n, palettes: updatedPals };
    });

  const palsUp = (updateFunc: (old: Palette[]) => Palette[]) =>
    persistUpdate((n) => ({ ...n, palettes: updateFunc(n.palettes) }));

  const simpleUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => updateFunc(oldStore));

  const saveUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal = updateFunc(oldStore);
      save(newVal);
      return newVal;
    });

  return {
    subscribe,
    undo: () =>
      saveUpdate((currentVal) => {
        if (undoStack.length === 0) return currentVal;
        redoStack.push(currentVal);
        return undoStack.pop()!;
      }),
    redo: () =>
      saveUpdate((currentVal) => {
        if (redoStack.length === 0) return currentVal;
        undoStack.push(currentVal);
        return redoStack.pop()!;
      }),
    pausePersistance: () =>
      simpleUpdate((currentVal) => {
        lastStore = currentVal;
        undoStack.push(currentVal);
        redoStack = [];
        pausePersistance = true;
        return currentVal;
      }),
    resumePersistance: () => {
      pausePersistance = false;
      persistUpdate(() => lastStore);
      undoStack.pop();
    },

    setCurrentPal: (pal: Palette) => palUp(() => pal),
    setCurrentPalColors: (colors: Color[]) => palUp((n) => ({ ...n, colors })),
    startUsingPal: (indx: number) => {
      persistUpdate((n) => ({ ...n, currentPal: indx }));
    },
    createNewPal: (newPal: Palette) =>
      persistUpdate((n) => ({
        currentPal: 0,
        palettes: [newPal, ...n.palettes],
      })),
    removePal: (index: number) =>
      persistUpdate((n) => {
        let palettes = [...n.palettes].filter((_, i) => i !== index);
        if (palettes.length === 0) {
          palettes = [stringPalToColorPal(newGenericPal("Example"))];
        }
        const currentPal =
          index === n.currentPal
            ? Math.min(index, palettes.length - 1)
            : index > n.currentPal
            ? n.currentPal
            : n.currentPal - 1;
        return { ...n, currentPal, palettes };
      }),
    duplicatePal: (index: number) =>
      palsUp((n) => {
        const newPal = { ...n[index], name: `${n[index].name} copy` };
        return [...n.slice(0, index), newPal, ...n.slice(index)];
      }),
    setSort: (sort: Color[]) => palUp((n) => ({ ...n, colors: deDup(sort) })),
    setCurrentPalName: (name: string) => palUp((n) => ({ ...n, name })),
    setCurrentPalType: (type: PalType) => palUp((n) => ({ ...n, type })),
    setCurrentPalEvalConfig: (evalConfig: Record<string, any>) =>
      palUp((n) => ({ ...n, evalConfig: hardCopy(evalConfig) })),
    addColorToCurrentPal: (color: Color) =>
      palUp((n) => ({ ...n, colors: [...n.colors, color] })),
    setBackground: (color: Color) =>
      palUp((n) => ({ ...n, background: color })),
    reset: () => set({ ...convertStoreHexToColor(InitialStore) }),

    setColorSpace: (colorSpace: ColorSpace) =>
      palUp((n) => ({
        ...n,
        colorSpace,
        background: Color.toColorSpace(n.background, colorSpace),
        colors: n.colors.map((x) => Color.toColorSpace(x, colorSpace)),
      })),
    clearPalettes: () =>
      persistUpdate(() => ({
        currentPal: 0,
        palettes: [stringPalToColorPal(newGenericPal("Example"))],
      })),
    setPalettes: (palettes: Palette[]) =>
      persistUpdate(() => ({
        currentPal: 0,
        palettes: palettes,
      })),
  };
}
const hardCopy = (x: any) => JSON.parse(JSON.stringify(x));

const store = createStore();

export default store;
