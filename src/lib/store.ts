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

function insertPalette(
  palettes: StoreData["palettes"],
  pal: Palette,
  palName: string
) {
  let nameCount = palettes.reduce(
    (acc, x) => acc + (x.name === palName ? 1 : 0),
    0
  );
  const name = nameCount === 0 ? palName : `${palName} ${nameCount}`;
  return [...palettes, { palette: pal, name }];
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
        mostRecentPal: "Untitled",
        palettes: insertPalette(n.palettes, n.currentPal, n.mostRecentPal),
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
