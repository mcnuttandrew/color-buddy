import { writable } from "svelte/store";

interface StoreData {
  route: "examples" | "compare" | "eval";
  comparePal: string | undefined;
  colorSim: "deuteranopia" | "protanopia" | "tritanopia" | "none";
  includeQuotes: boolean;
  xZoom: [number, number];
  yZoom: [number, number];
  zZoom: [number, number];
}

const InitialStore: StoreData = {
  route: "examples",
  comparePal: undefined,
  colorSim: "none",
  includeQuotes: false,
  xZoom: [0, 1],
  yZoom: [0, 1],
  zZoom: [0, 1],
};
const storeName = "color-pal-nav-store";

const addDefaults = (store: StoreData): StoreData => {
  return {
    ...InitialStore,
    ...store,
  };
};

function createStore() {
  const storeData: StoreData = addDefaults(
    JSON.parse(localStorage.getItem(storeName) || JSON.stringify(InitialStore))
  );

  localStorage.setItem(storeName, JSON.stringify(storeData));
  const { subscribe, set, update } = writable<StoreData>(storeData);
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      localStorage.setItem(storeName, JSON.stringify(newVal));
      return newVal;
    });

  return {
    subscribe,
    setRoute: (route: StoreData["route"]) =>
      persistUpdate((old) => ({ ...old, route })),
    setComparePal: (comparePal: StoreData["comparePal"]) =>
      persistUpdate((old) => ({ ...old, comparePal })),
    reset: () => set({ ...InitialStore }),
    setColorSim: (colorSim: StoreData["colorSim"]) =>
      persistUpdate((old) => ({ ...old, colorSim })),
    setIncludeQuotes: (includeQuotes: StoreData["includeQuotes"]) =>
      persistUpdate((old) => ({ ...old, includeQuotes })),
    setZoom: (axis: "x" | "y" | "z", zoom: [number, number]) =>
      persistUpdate((old) => ({ ...old, [axis + "Zoom"]: zoom })),
  };
}

const store = createStore();

export default store;
