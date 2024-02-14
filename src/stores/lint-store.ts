import { writable } from "svelte/store";
import * as idb from "idb-keyval";
import type { CustomLint } from "../lib/lints/CustomLint";
import type { TaskType } from "../lib/lints/ColorLint";
import { JSONStringify } from "../lib/utils";
import BUILT_INS from "../lib/lints/built-in-lints";
import { loadLints } from "../lib/api-calls";

interface StoreData {
  lints: CustomLint[];
  focusedLint: string | false;
}

const InitialStore: StoreData = {
  lints: [],
  focusedLint: false,
};

const builtInIndex = BUILT_INS.reduce((acc, x) => {
  acc[x.id] = x;
  return acc;
}, {} as Record<string, CustomLint>);

const storeName = "color-pal-lints";
function createStore() {
  let storeData: StoreData = JSON.parse(JSON.stringify(InitialStore));
  // turn on the web worker and load whatever lints are in the store
  loadLints();

  const { subscribe, set, update } = writable<StoreData>(storeData);
  idb.get(storeName).then((x) => {
    let storeBase = { ...InitialStore, ...x };
    let lints = (storeBase.lints || []).map(
      (x: CustomLint) => builtInIndex[x.id] || x
    ) as CustomLint[];
    const missingBuiltIns = BUILT_INS.filter(
      (x) => !lints.find((y) => y.id === x.id)
    );
    const newStore = { ...storeBase, lints: [...lints, ...missingBuiltIns] };
    set(newStore);
    idb.set(storeName, newStore);
  });
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      idb.set(storeName, newVal).then(() => {
        loadLints();
      });
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
    setCurrentLintBlameMode: (blameMode: "pair" | "single" | "none") =>
      lintUpdate((old) => ({ ...old, blameMode })),
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
    blameMode: "none",
    ...newLintFrag,
  };
}

const store = createStore();

export default store;
