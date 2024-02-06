import { writable } from "svelte/store";
import * as idb from "idb-keyval";
import type { CustomLint } from "../lib/lints/CustomLint";
import type { TaskType } from "../lib/lints/ColorLint";
import { JSONStringify } from "../lib/utils";

interface StoreData {
  lints: CustomLint[];
  focusedLint: string | false;
}

const InitialStore: StoreData = {
  lints: [],
  focusedLint: false,
};

export const BUILT_INS: CustomLint[] = [
  {
    program: JSONStringify(
      JSON.stringify({
        $schema: "http://localhost:8888/lint-schema.json",
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
      })
    ),
    name: "Avoid extreme colors",
    taskTypes: ["sequential", "diverging", "categorical"] as TaskType[],
    level: "warning",
    group: "design",
    description: `Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against.`,
    failMessage: `Colors at either end of the lightness spectrum {{blame}} are hard to discriminate in some contexts, and are sometimes advised against`,
    id: "extreme-colors-built-in",
  },
  {
    program: JSONStringify(
      JSON.stringify({
        $schema: "http://localhost:8888/lint-schema.json",
        "<": { left: { count: "colors" }, right: 10 },
      })
    ),
    name: "Avoid too many colors",
    taskTypes: ["sequential", "diverging", "categorical"] as TaskType[],
    level: "warning",
    group: "design",
    description:
      "Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.",
    failMessage: `This palette has too many colors and may be hard to discriminate in some contexts. Maximum: 10.`,
    id: "too-many-colors-built-in",
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

  const lintUpdate = (updateFunc: (old: CustomLint) => CustomLint) =>
    persistUpdate((n) => {
      const focusedLintIndex = n.lints.findIndex((x) => x.id === n.focusedLint);
      const focusedLint = n.lints[focusedLintIndex];
      if (!focusedLint) {
        return n;
      }
      const newLint = updateFunc(focusedLint);
      const updatedLints = [...n.lints];
      updatedLints[focusedLintIndex] = newLint;
      return { ...n, lints: updatedLints };
    });

  return {
    subscribe,
    set: (newStore: StoreData) => persistUpdate(() => newStore),
    reset: () => persistUpdate(() => ({ ...InitialStore })),
    setFocusedLint: (n: StoreData["focusedLint"]) =>
      persistUpdate((old) => ({ ...old, focusedLint: n })),
    setCurrentLintProgram: (program: string) =>
      lintUpdate((old) => ({ ...old, program })),
    setCurrentLintName: (name: string) =>
      lintUpdate((old) => ({ ...old, name })),
    setCurrentLintTaskTypes: (taskTypes: TaskType[]) =>
      lintUpdate((old) => ({ ...old, taskTypes })),
    setCurrentLintLevel: (level: "error" | "warning") =>
      lintUpdate((old) => ({ ...old, level })),
    setCurrentLintGroup: (group: string) =>
      lintUpdate((old) => ({ ...old, group })),
    setCurrentLintDescription: (description: string) =>
      lintUpdate((old) => ({ ...old, description })),
    setCurrentLintFailMessage: (failMessage: string) =>
      lintUpdate((old) => ({ ...old, failMessage })),
    deleteLint: (id: string) =>
      persistUpdate((old) => ({
        ...old,
        lints: old.lints.filter((x) => x.id !== id),
      })),
    createNewLint: (newLintFrag: Partial<CustomLint>) =>
      persistUpdate((old) => ({
        ...old,
        lints: [...old.lints, newLint(newLintFrag)],
      })),
  };
}

function newLint(newLintFrag: Partial<CustomLint>): CustomLint {
  return {
    program: JSONStringify("{}"),
    name: "New lint",
    taskTypes: ["categorical", "sequential", "diverging"],
    level: "warning",
    group: "custom",
    description: "v confusing",
    failMessage: "v confusing",
    id: Math.random().toString(),
    ...newLintFrag,
  };
}

const store = createStore();

export default store;
