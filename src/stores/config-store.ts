import { writable } from "svelte/store";

interface StoreData {
  colorSim: "deuteranopia" | "protanopia" | "tritanopia" | "none" | "grayscale";
  comparePal: number | undefined;
  engine: "openai" | "google";
  evalDisplayMode: "regular" | "compact";
  evalDeltaDisplay: "none" | "76" | "CMC" | "2000" | "ITP" | "Jz" | "OK";
  includeQuotes: boolean;
  leftRoute: "controls" | "palettes";
  route: "examples" | "compare" | "eval";
  scatterplotMode: "moving" | "putting";
  showColorBackground: boolean;
  tooltipXY?: [string, string];
  useSimulatorOnExamples: boolean;
  xZoom: [number, number];
  yZoom: [number, number];
  zZoom: [number, number];
}

const InitialStore: StoreData = {
  colorSim: "none",
  comparePal: undefined,
  engine: "openai",
  evalDisplayMode: "regular",
  evalDeltaDisplay: "none",
  includeQuotes: false,
  leftRoute: "palettes",
  route: "examples",
  scatterplotMode: "moving",
  showColorBackground: true,
  tooltipXY: undefined,
  useSimulatorOnExamples: false,
  xZoom: [0, 1],
  yZoom: [0, 1],
  zZoom: [0, 1],
};
const storeName = "color-pal-nav-store";

const addDefaults = (store: StoreData): StoreData => {
  const newStore = {
    ...InitialStore,
    ...store,
  };
  // delete any keys that are not in the initial store
  for (const key in newStore) {
    if (!(key in InitialStore)) {
      delete newStore[key];
    }
  }
  return newStore;
};

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
    setEvalDisplayMode: (evalDisplayMode: StoreData["evalDisplayMode"]) =>
      persist((old) => ({ ...old, evalDisplayMode })),
    setEvalDeltaDisplay: (evalDeltaDisplay: StoreData["evalDeltaDisplay"]) =>
      persist((old) => ({ ...old, evalDeltaDisplay })),
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
    setLeftPanelRoute: (route: StoreData["leftRoute"]) =>
      persist((old) => ({ ...old, leftRoute: route })),
    setScatterplotMode: (n: StoreData["scatterplotMode"]) =>
      persist((old) => ({ ...old, scatterplotMode: n })),
    setUseSimulatorOnExamples: (n: StoreData["useSimulatorOnExamples"]) =>
      persist((old) => ({ ...old, useSimulatorOnExamples: n })),
  };
}

const store = createStore();

export default store;
