import { writable } from "svelte/store";

interface StoreData {
  route: "examples" | "compare" | "eval";
  controlsOpen: boolean;
  savedPalsOpen: boolean;
  comparePal: string | undefined;
  colorSim: "deuteranopia" | "protanopia" | "tritanopia" | "none";
  includeQuotes: boolean;
  xZoom: [number, number];
  yZoom: [number, number];
  zZoom: [number, number];
  engine: "openai" | "google";
  showColorBackground: boolean;
  tooltipXY?: [string, string];
}

const InitialStore: StoreData = {
  route: "examples",
  controlsOpen: false,
  savedPalsOpen: true,
  comparePal: undefined,
  colorSim: "none",
  includeQuotes: false,
  xZoom: [0, 1],
  yZoom: [0, 1],
  zZoom: [0, 1],
  engine: "openai",
  showColorBackground: true,
  tooltipXY: undefined,
};
const storeName = "color-pal-nav-store";

const addDefaults = (store: StoreData): StoreData => ({
  ...InitialStore,
  ...store,
});

function createStore() {
  const storeData: StoreData = addDefaults(
    JSON.parse(localStorage.getItem(storeName) || JSON.stringify(InitialStore))
  );

  localStorage.setItem(storeName, JSON.stringify(storeData));
  const { subscribe, set, update } = writable<StoreData>(storeData);
  const persist = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      localStorage.setItem(storeName, JSON.stringify(newVal));
      return newVal;
    });

  return {
    subscribe,
    setRoute: (route: StoreData["route"]) =>
      persist((old) => ({ ...old, route })),
    setComparePal: (comparePal: StoreData["comparePal"]) =>
      persist((old) => ({ ...old, comparePal })),
    reset: () => set({ ...InitialStore }),
    setColorSim: (colorSim: StoreData["colorSim"]) =>
      persist((old) => ({ ...old, colorSim })),
    setIncludeQuotes: (includeQuotes: StoreData["includeQuotes"]) =>
      persist((old) => ({ ...old, includeQuotes })),
    setZoom: (axis: "x" | "y" | "z", zoom: [number, number]) =>
      persist((old) => ({ ...old, [axis + "Zoom"]: zoom })),
    setEngine: (engine: StoreData["engine"]) =>
      persist((old) => ({ ...old, engine })),
    setShowColorBackground: (n: StoreData["showColorBackground"]) =>
      persist((old) => ({ ...old, showColorBackground: n })),
    setTooltipXY: (xy: StoreData["tooltipXY"]) =>
      persist((old) => ({ ...old, tooltipXY: xy })),
    setControlsOpen: (n: StoreData["controlsOpen"]) =>
      persist((old) => ({ ...old, controlsOpen: n })),
    setSavedPalsOpen: (n: StoreData["savedPalsOpen"]) =>
      persist((old) => ({ ...old, savedPalsOpen: n })),
  };
}

const store = createStore();

export default store;
