import { writable } from "svelte/store";

interface StoreData {
  colorSim: "deuteranopia" | "protanopia" | "tritanopia" | "none" | "grayscale";
  comparePal: number | undefined;
  compareSelectedExample: number;
  channelPickerSpace: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  channelPickerSpaceBackground: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  compareBackground: string | undefined;
  compareBackgroundSpace: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  engine: "openai" | "google";
  evalDisplayMode: "regular" | "compact" | "lint-customization";
  evalDeltaDisplay: "none" | "76" | "CMC" | "2000" | "ITP" | "Jz" | "OK";
  exampleRoute: "svg" | "vega" | "swatches";
  includeQuotes: boolean;
  leftRoute: "controls" | "palettes" | "colors";
  route: "examples" | "compare" | "eval" | "browse";
  scatterplotMode: "moving" | "putting";
  showGamutMarkers: boolean;
  showColorBackground: boolean;
  tooltipXY?: [string, string];
  useSimulatorOnExamples: boolean;
  mainColumnRoute: "palette-config" | "example";
  mainColumnSelectedExample: number;
  xZoom: [number, number];
  yZoom: [number, number];
  zZoom: [number, number];
}

const InitialStore: StoreData = {
  colorSim: "none",
  comparePal: undefined,
  compareSelectedExample: -1,
  compareBackground: undefined,
  compareBackgroundSpace: "lab",
  engine: "openai",
  evalDisplayMode: "regular",
  evalDeltaDisplay: "none",
  exampleRoute: "vega",
  includeQuotes: false,
  leftRoute: "palettes",
  route: "examples",
  scatterplotMode: "moving",
  showColorBackground: true,
  showGamutMarkers: true,
  tooltipXY: undefined,
  mainColumnRoute: "palette-config",
  mainColumnSelectedExample: -1,
  useSimulatorOnExamples: false,
  channelPickerSpace: "lab",
  channelPickerSpaceBackground: "lab",
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
      // @ts-ignore
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
    setShowGamutMarkers: (n: StoreData["showGamutMarkers"]) =>
      persist((old) => ({ ...old, showGamutMarkers: n })),
    setUseSimulatorOnExamples: (n: StoreData["useSimulatorOnExamples"]) =>
      persist((old) => ({ ...old, useSimulatorOnExamples: n })),
    setMainColumnRoute: (n: StoreData["mainColumnRoute"]) =>
      persist((old) => ({ ...old, mainColumnRoute: n })),
    setMainColumnSelectedExample: (n: StoreData["mainColumnSelectedExample"]) =>
      persist((old) => ({ ...old, mainColumnSelectedExample: n })),
    setCompareSelectedExample: (n: StoreData["compareSelectedExample"]) =>
      persist((old) => ({ ...old, compareSelectedExample: n })),
    setExampleRoute: (n: StoreData["exampleRoute"]) =>
      persist((old) => ({ ...old, exampleRoute: n })),
    setChannelPickerSpace: (n: StoreData["channelPickerSpace"]) =>
      persist((old) => ({ ...old, channelPickerSpace: n })),
    setChannelPickerSpaceBackground: (
      n: StoreData["channelPickerSpaceBackground"]
    ) => persist((old) => ({ ...old, channelPickerSpaceBackground: n })),
    setCompareBackground: (n: StoreData["compareBackground"]) =>
      persist((old) => ({ ...old, compareBackground: n })),
    setCompareBackgroundSpace: (n: StoreData["compareBackgroundSpace"]) =>
      persist((old) => ({ ...old, compareBackgroundSpace: n })),
  };
}

const store = createStore();

export default store;
