import { writable } from "svelte/store";
import chroma from "chroma-js";
import type { Color } from "chroma-js";
import fits from "../assets/outfits.json";
import { pick } from "../utils";
const outfitToPal = (x: any) => [x.fill1, x.fill2, x.fill3];
const outfits = fits.map((x) => outfitToPal(x));
type Pal<A> = { colors: A[]; name: string; background: A };
export type Palette = Pal<Color>;

interface StoreData {
  palettes: Pal<Color>[];
  currentPal: Pal<Color>;
}

interface StorageData {
  palettes: Pal<string>[];
  currentPal: Pal<string>;
}

const InitialStore: StorageData = {
  palettes: [
    { name: "Example 1", colors: pick(outfits), background: "#ffffff" },
    { name: "Example 2", colors: pick(outfits), background: "#ffffff" },
    { name: "Example 3", colors: pick(outfits), background: "#ffffff" },
  ],
  currentPal: {
    name: "Untitled",
    colors: pick(outfits),
    background: "#ffffff",
  },
};

function convertStoreHexToColor(store: StorageData): StoreData {
  return {
    palettes: store.palettes.map((x) => ({
      name: x.name,
      background: chroma(x.background),
      colors: x.colors.map((y) => chroma(y)),
    })),
    currentPal: {
      background: chroma(store.currentPal.background),
      name: store.currentPal.name,
      colors: store.currentPal.colors.map((y) => chroma(y)),
    },
  };
}

function convertStoreColorToHex(store: StoreData): StorageData {
  return {
    palettes: store.palettes.map((x) => ({
      name: x.name,
      background: x.background.hex(),
      colors: x.colors.map((y) => y.hex()),
    })),
    currentPal: {
      background: store.currentPal.background.hex(),
      name: store.currentPal.name,
      colors: store.currentPal.colors.map((y) => y.hex()),
    },
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

function createStore() {
  const storeData: StoreData = convertStoreHexToColor(
    JSON.parse(
      localStorage.getItem("color-pal") || JSON.stringify(InitialStore)
    )
  );

  localStorage.setItem(
    "color-pal",
    JSON.stringify(convertStoreColorToHex(storeData))
  );
  const { subscribe, set, update } = writable<StoreData>(storeData);
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      localStorage.setItem(
        "color-pal",
        JSON.stringify(convertStoreColorToHex(newVal))
      );
      return newVal;
    });

  const simpleSet = (key: keyof StoreData) => (val: any) =>
    persistUpdate((n) => ({ ...n, [key]: val }));

  return {
    subscribe,
    setPalettes: simpleSet("palettes"),
    setCurrentPalColors: (colors: Color[]) =>
      persistUpdate((n) => ({ ...n, currentPal: { ...n.currentPal, colors } })),
    startUsingPal: (palName: string) => {
      persistUpdate((n) => {
        const newPal = n.palettes.find((x) => x.name === palName);
        if (!newPal) return n;
        const updatedPals = insertPalette(
          n.palettes.filter((x) => x.name !== palName),
          n.currentPal
        );
        return {
          ...n,
          currentPal: newPal,
          palettes: updatedPals,
        };
      });
    },
    createNewPal: () =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          colors: pick(outfits).map((x: string) => chroma(x)),
          name: "Untitled",
          background: chroma("#ffffff"),
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
    randomizeOrder: () =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          ...n.currentPal,
          colors: n.currentPal.colors.sort(() => Math.random() - 0.5),
        },
      })),
    sortByHue: () =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          ...n.currentPal,
          colors: n.currentPal.colors.sort((a, b) => a.hsl()[0] - b.hsl()[0]),
        },
      })),
    replaceColor: (oldColor: Color, newColor: Color) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          ...n.currentPal,
          colors: n.currentPal.colors.map((x) =>
            x.hex() === oldColor.hex() ? newColor : x
          ),
        },
      })),
    setCurrentPalName: (name: string) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: { ...n.currentPal, name },
      })),
    addColorToCurrentPal: (color: Color) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          ...n.currentPal,
          colors: [...n.currentPal.colors, color],
        },
      })),
    setBackground: (color: Color) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: { ...n.currentPal, background: color },
      })),
    reset: () => set({ ...convertStoreHexToColor(InitialStore) }),
  };
}

const store = createStore();

export default store;
