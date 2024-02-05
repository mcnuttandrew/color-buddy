import { writable } from "svelte/store";
import * as idb from "idb-keyval";
import type { CustomLint } from "../lib/lints/CustomLint";
import type { TaskType } from "../lib/lints/ColorLint";

interface StoreData {
  lints: CustomLint[];
  focusedLint: string | undefined;
}

const InitialStore: StoreData = {
  lints: [],
  focusedLint: undefined,
};

export const BUILT_INS: CustomLint[] = [
  {
    program: {
      all: {
        in: "colors",
        varb: "a",
        predicate: {
          all: {
            in: ["#000000", "#ffffff"],
            varb: "b",
            predicate: {
              not: { similar: { left: "a", right: "b", threshold: 12 } },
            },
          },
        },
      },
    },
    name: "Avoid extreme colors",
    taskTypes: ["sequential", "diverging", "categorical"] as TaskType[],
    level: "warning",
    group: "design",
    description: `Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against.`,
    failMessage: `Colors at either end of the lightness spectrum {{blame}} are hard to discriminate in some contexts, and are sometimes advised against`,
  },
  {
    program: { "<": { left: { count: "colors" }, right: 10 } },
    name: "Avoid too many colors",
    taskTypes: ["sequential", "diverging", "categorical"] as TaskType[],
    level: "warning",
    group: "design",
    description:
      "Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.",
    failMessage: `This palette has too many colors and may be hard to discriminate in some contexts. Maximum: 10.`,
  },
];

// TODO return from modification???

const storeName = "color-pal-lints";
function createStore() {
  let storeData: StoreData = JSON.parse(JSON.stringify(InitialStore));

  const { subscribe, set, update } = writable<StoreData>(storeData);
  idb.get(storeName).then((x) => {
    if (x) {
      set({ ...x, lints: x.lints || [] } as StoreData);
    } else {
      set({ ...InitialStore, lints: BUILT_INS });
    }
  });
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      idb.set(storeName, newVal);
      return newVal;
    });

  return {
    subscribe,
    set: (newStore: StoreData) => persistUpdate(() => newStore),
    reset: () => persistUpdate(() => ({ ...InitialStore })),
    setFocusedLint: (n: string | undefined) =>
      persistUpdate((old) => ({ ...old, focusedLint: n })),
  };
}

const store = createStore();

export default store;
