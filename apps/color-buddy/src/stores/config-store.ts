import { writable } from "svelte/store";
import type { Engine } from "../lib/api-calls";

interface StoreData {
  channelPickerSpace: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  channelPickerSpaceBackground: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  colorSim: "deuteranopia" | "protanopia" | "tritanopia" | "none" | "grayscale";
  compareBackground: string | undefined;
  compareBackgroundSpace: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  comparePal: number | undefined;
  compareSelectedExample: number;
  engine: Engine;
  evalDeltaDisplay: "none" | "76" | "CMC" | "2000" | "ITP" | "Jz" | "OK";
  evalDisplayMode: "regular" | "compact" | "lint-customization";
  exampleRoute: "svg" | "vega" | "swatches";
  includeQuotes: boolean;
  leftRoute: "controls" | "colors";
  mainColumnSelectedExample: number;
  manageBrowsePreviewIdx: number;
  route: "examples" | "compare" | "eval" | "browse" | "manage";
  scatterplotMode: "moving" | "putting";
  showColorBackground: boolean;
  showGamutMarkers: boolean;
  tooltipXY?: [string, string];
  tour: boolean;
  useSimulatorOnExamples: boolean;
  xZoom: [number, number];
  yZoom: [number, number];
  zZoom: [number, number];
}

const InitialStore: StoreData = {
  colorSim: "none",
  channelPickerSpace: "lab",
  channelPickerSpaceBackground: "lab",
  compareBackground: undefined,
  compareBackgroundSpace: "lab",
  comparePal: undefined,
  compareSelectedExample: -1,
  engine: "openai",
  evalDeltaDisplay: "none",
  evalDisplayMode: "regular",
  exampleRoute: "vega",
  includeQuotes: false,
  leftRoute: "controls",
  mainColumnSelectedExample: -1,
  manageBrowsePreviewIdx: -1,
  route: "examples",
  scatterplotMode: "moving",
  showColorBackground: true,
  showGamutMarkers: true,
  tooltipXY: undefined,
  tour: false,
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
    setTour: (n: StoreData["tour"]) => persist((old) => ({ ...old, tour: n })),
    setManageBrowsePreviewIdx: (n: StoreData["manageBrowsePreviewIdx"]) =>
      persist((old) => ({ ...old, manageBrowsePreviewIdx: n })),
  };
}

const store = createStore();

export default store;