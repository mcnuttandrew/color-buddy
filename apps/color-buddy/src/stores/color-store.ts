import { writable } from "svelte/store";
import { Color } from "color-buddy-palette";
import type { Palette, StringPalette, ColorSpace } from "color-buddy-palette";

import { deDup, newGenericPal, convertPalToSpace } from "../lib/utils";

import { DEFAULT_LINT_LIST } from "../lib/pre-built-lint-configs";
const DEFAULT_LINT_SET = new Set(DEFAULT_LINT_LIST);

interface StoreData {
  palettes: Palette[];
  currentPal: number;
  globallyIgnoredLints: string[];
}

interface StorageData {
  palettes: StringPalette[];
  currentPal: number;
  globallyIgnoredLints: string[];
}

function stringPalToColorPal(pal: StringPalette): Palette {
  const result = {
    ...pal,
    background: Color.colorFromString(pal.background, pal.colorSpace),
    colors: pal.colors.map((x) => {
      // catch old versions
      if (typeof x === "string") {
        const color = Color.colorFromString(x, pal.colorSpace);
        color.tags = [];
        return color;
      }
      const color = Color.colorFromString(x.color, pal.colorSpace);
      color.tags = x.tags;
      return color;
    }),
  };

  return result;
}

function colorPalToStringPal(pal: Palette): StringPalette {
  return {
    ...pal,
    background: pal.background.toString(),
    colors: pal.colors.map((x) => {
      return { color: x.toString(), tags: x.tags };
    }),
  };
}
const makeExample = (name: string) => colorPalToStringPal(newGenericPal(name));

const InitialStore: StorageData = {
  palettes: [
    makeExample("Example 1"),
    makeExample("Example 2"),
    makeExample("Example 3"),
  ],
  currentPal: 0,
  globallyIgnoredLints: [...DEFAULT_LINT_SET],
};

function convertStoreHexToColor(store: StorageData): StoreData {
  return {
    palettes: store.palettes.map(stringPalToColorPal),
    currentPal: store.currentPal,
    globallyIgnoredLints: store.globallyIgnoredLints,
  };
}

function convertStoreColorToHex(store: StoreData): StorageData {
  return {
    palettes: store.palettes.map((x) => ({
      ...x,
      background: x.background.toString(),
      colors: x.colors.map((y) => ({ color: y.toString(), tags: y.tags })),
    })),
    currentPal: store.currentPal,
    globallyIgnoredLints: store.globallyIgnoredLints,
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
        ...n,
        currentPal: 0,
        palettes: [newPal, ...n.palettes],
      })),
    removePal: (index: number) =>
      persistUpdate((n) => {
        let palettes = [...n.palettes].filter((_, i) => i !== index);
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
    setCurrentPalType: (type: Palette["type"]) =>
      palUp((n) => ({ ...n, type })),
    setCurrentTags: (tags: Palette["tags"]) => palUp((n) => ({ ...n, tags })),

    setCurrentPalEvalConfig: (evalConfig: Record<string, any>) =>
      palUp((n) => ({ ...n, evalConfig: hardCopy(evalConfig) })),
    addColorToCurrentPal: (color: Color) =>
      palUp((n) => ({ ...n, colors: [...n.colors, color] })),
    setBackground: (color: Color) =>
      palUp((n) => ({ ...n, background: color })),
    reset: () => set({ ...convertStoreHexToColor(InitialStore) }),

    setColorSpace: (colorSpace: ColorSpace) =>
      palUp((n) => convertPalToSpace(n, colorSpace)),
    clearPalettes: () =>
      persistUpdate((n) => ({ ...n, currentPal: 0, palettes: [] })),
    renamePalette: (index: number, name: string) =>
      persistUpdate((n) => {
        const palettes = [...n.palettes];
        palettes[index] = { ...palettes[index], name };
        return { ...n, palettes };
      }),
    setPalettes: (palettes: Palette[]) =>
      persistUpdate((n) => ({ ...n, currentPal: 0, palettes: palettes })),
    setGloballyIgnoredLints: (lints: string[]) =>
      persistUpdate((old) => ({ ...old, globallyIgnoredLints: [...lints] })),
  };
}
const hardCopy = (x: any) => JSON.parse(JSON.stringify(x));

const store = createStore();

export default store;
