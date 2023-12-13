import { writable } from "svelte/store";
import outfits from "../assets/outfits.json";
import { pick } from "../utils";
export type Palette = string[];

interface StoreData {
  palettes: { palette: Palette; name: string }[];
  currentPal: Palette;
  mostRecentPal: string;
}

const outfitToPal = (x: any) => [x.fill1, x.fill2, x.fill3];

const InitialStore: StoreData = {
  palettes: [
    { name: "Example 1", palette: outfitToPal(pick(outfits)) },
    { name: "Example 2", palette: outfitToPal(pick(outfits)) },
    { name: "Example 3", palette: outfitToPal(pick(outfits)) },
  ],
  currentPal: outfitToPal(pick(outfits)),
  mostRecentPal: "Untitled",
};

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

  //   const setIn = (group: string) => (key: string, val: number) =>
  //     persistUpdate((oldStore) => ({
  //       ...oldStore,
  //       [group]: { ...oldStore[group], [key]: val },
  //     }));
  const simpleSet = (key: keyof StoreData) => (val: any) =>
    persistUpdate((n) => ({ ...n, [key]: val }));

  return {
    subscribe,
    setPalettes: simpleSet("palettes"),
    setMostRecentPal: simpleSet("mostRecentPal"),
    setCurrentPal: simpleSet("currentPal"),
    startUsingPal: (pal: string) => {
      persistUpdate((n) => {
        const newPal = n.palettes.find((x) => x.name === pal);
        if (!newPal) return n;
        const updatedPals = n.palettes.filter((x) => x.name !== pal);
        updatedPals.unshift({ palette: n.currentPal, name: n.mostRecentPal });
        return {
          ...n,
          currentPal: newPal.palette,
          mostRecentPal: pal,
          palettes: updatedPals,
        };
      });
    },
    createNewPal: () =>
      persistUpdate((n) => ({
        ...n,
        currentPal: outfitToPal(pick(outfits)),
        name: "Untitled",
        palettes: [
          ...n.palettes,
          { palette: n.currentPal, name: n.mostRecentPal },
        ],
      })),
    removePal: (pal: string) =>
      persistUpdate((n) => ({
        ...n,
        palettes: n.palettes.filter((x) => x.name !== pal),
      })),
    reset: () => set({ ...InitialStore }),
  };
}

export const store = createStore();
