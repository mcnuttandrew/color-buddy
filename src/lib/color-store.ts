import { writable } from "svelte/store";
import fits from "../assets/outfits.json";
import { pick } from "../utils";
const outfitToPal = (x: any) => [x.fill1, x.fill2, x.fill3];
const outfits = fits.map((x) => outfitToPal(x));
export type Palette = { colors: string[]; name: string; background: string };

interface StoreData {
  palettes: Palette[];
  currentPal: Palette;
}

const InitialStore: StoreData = {
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

function insertPalette(palettes: Palette[], pal: Palette): Palette[] {
  let nameCount = palettes.reduce(
    (acc, x) => acc + (x.name === pal.name ? 1 : 0),
    0
  );
  const name = nameCount === 0 ? pal.name : `${pal.name} ${nameCount}`;
  return [...palettes, { ...pal, name }];
}

function createStore() {
  const storeData: StoreData = JSON.parse(
    localStorage.getItem("color-pal") || JSON.stringify(InitialStore)
  );
  localStorage.setItem("color-pal", JSON.stringify(storeData));
  const { subscribe, set, update } = writable<StoreData>(storeData);
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      localStorage.setItem("color-pal", JSON.stringify(newVal));
      return newVal;
    });

  const simpleSet = (key: keyof StoreData) => (val: any) =>
    persistUpdate((n) => ({ ...n, [key]: val }));

  return {
    subscribe,
    setPalettes: simpleSet("palettes"),
    setCurrentPalColors: (colors: string[]) =>
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
          colors: pick(outfits),
          name: "Untitled",
          background: "#ffffff",
        },
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
    replaceColor: (oldColor: string, newColor: string) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          ...n.currentPal,
          colors: n.currentPal.colors.map((x) =>
            x === oldColor ? newColor : x
          ),
        },
      })),
    setCurrentPalName: (name: string) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: { ...n.currentPal, name },
      })),
    addColorToCurrentPal: (color: string) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: {
          ...n.currentPal,
          colors: [...n.currentPal.colors, color],
        },
      })),
    setBackground: (color: string) =>
      persistUpdate((n) => ({
        ...n,
        currentPal: { ...n.currentPal, background: color },
      })),
    reset: () => set({ ...InitialStore }),
  };
}

const store = createStore();

export default store;
