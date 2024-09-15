import { writable } from "svelte/store";
import type { Palette } from "color-buddy-palette";
import type { Engine } from "../lib/api-calls";
import { colorPalToStringPal, stringPalToColorPal } from "../lib/utils";

interface StoreData {
  channelPickerSpace: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  channelPickerSpaceBackground: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  colorSim: "deuteranopia" | "protanopia" | "tritanopia" | "none" | "grayscale";
  compareBackground: string | undefined;
  compareBackgroundSpace: "lab" | "lch" | "hsl" | "hsv" | "rgb";
  comparePal: number | undefined | "tempPal";
  compareSelectedExample: number;
  engine: Engine;
  evalDeltaDisplay: "none" | "76" | "CMC" | "2000" | "ITP" | "Jz" | "OK";
  evalDisplayMode: "regular" | "compact" | "lint-customization";
  exampleRoute: "svg" | "vega" | "swatches";
  includeQuotes: boolean;
  leftRoute: "controls" | "colors";
  mainColumnSelectedExample: number;
  manageBrowsePreviewIdx: number;
  route: "examples" | "compare" | "eval" | "manage";
  scatterplotMode: "moving" | "putting";
  selectedFolder: { isPreMade: boolean; name: string };
  showColorBackground: "always show" | "show on drag" | "never show";
  showGamutMarkers: boolean;
  tempPal: Palette | undefined;
  tooltipXY?: [string, string];
  tour: boolean;
  useSimulatorOnExamples: boolean;
  userName: string;
  xZoom: [number, number];
  yZoom: [number, number];
  zZoom: [number, number];
}

const randomUserName = () =>
  "User" + Math.floor(Math.random() * 1000000).toString();

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
  selectedFolder: { isPreMade: false, name: "" },
  scatterplotMode: "moving",
  showColorBackground: "show on drag",
  showGamutMarkers: true,
  tempPal: undefined,
  tooltipXY: undefined,
  tour: false,
  useSimulatorOnExamples: false,
  userName: randomUserName(),
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
  if (typeof newStore.showColorBackground === "boolean") {
    newStore.showColorBackground = newStore.showColorBackground
      ? "show on drag"
      : "never show";
  }

  // delete any keys that are not in the initial store
  for (const key in newStore) {
    if (!(key in InitialStore)) {
      // @ts-ignore
      delete newStore[key];
    }
  }
  return newStore;
};

function hydrateStore(): StoreData {
  let str = localStorage.getItem(storeName) || JSON.stringify(InitialStore);
  if (str === "undefined") {
    str = JSON.stringify(InitialStore);
  }
  console.log(str, localStorage.getItem(storeName));
  const store = addDefaults(JSON.parse(str));
  if (store.tempPal) {
    store.tempPal = stringPalToColorPal(store.tempPal as any);
  }
  return store;
}
function serializeStore(store: StoreData) {
  const copy = { ...store } as any;
  if (copy.tempPal) {
    copy.tempPal = colorPalToStringPal(copy.tempPal);
  }
  localStorage.setItem(storeName, JSON.stringify(copy));
}

function createStore() {
  const storeData: StoreData = hydrateStore();

  serializeStore(storeData);
  const { subscribe, set, update } = writable<StoreData>(storeData);
  const persist = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      serializeStore(newVal);
      return newVal;
    });

  return {
    subscribe,
    setRoute: (route: StoreData["route"]) =>
      persist((old) => ({ ...old, route })),
    setComparePal: (comparePal: number | undefined | Palette) => {
      if (typeof comparePal === "number") {
        return persist((old) => ({ ...old, comparePal, tempPal: undefined }));
      } else {
        return persist((old) => ({
          ...old,
          tempPal: comparePal,
          comparePal: "tempPal",
        }));
      }
    },
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
    setSelectedFolder: (n: StoreData["selectedFolder"]) =>
      persist((old) => ({ ...old, selectedFolder: n })),
  };
}

const store = createStore();

export default store;
