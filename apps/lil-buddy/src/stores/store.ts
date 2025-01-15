import { writable } from "svelte/store";
import { Color } from "color-buddy-palette";
import type { LintResult, LintProgram } from "color-buddy-palette-lint";
import type { Palette, StringPalette, ColorSpace } from "color-buddy-palette";

import { DEFAULT_LINT_LIST } from "../lib/pre-built-lint-configs";
const DEFAULT_LINT_SET = new Set(DEFAULT_LINT_LIST);

export function newId() {
  return Math.random().toString();
}

function newLint(newLintFrag: Partial<LintProgram>): LintProgram {
  return {
    blameMode: "none",
    description: "v confusing",
    expectedFailingTests: [...(newLintFrag.expectedFailingTests || [])],
    expectedPassingTests: [...(newLintFrag.expectedPassingTests || [])],
    failMessage: "v confusing",
    group: "custom",
    id: newId(),
    level: "warning",
    name: "New lint",
    program: JSON.stringify("{}"),
    requiredTags: [],
    taskTypes: ["categorical", "sequential", "diverging"],
    ...newLintFrag,
  };
}

interface StoreData {
  lints: LintProgram[];
  focusedLint: string | false;
  currentChecks: LintResult[];
  loadState?: "loading" | "idle";
  engine: "openai" | "anthropic";
}

interface StorageData {
  lints: [];
  focusedLint: false;
  currentChecks: [];
  loadState: "idle";
  engine: "openai" | "anthropic";
}

const InitialStore: StorageData = {
  lints: [],
  focusedLint: false,
  currentChecks: [],
  loadState: "idle",
  engine: "openai",
};

function serializePalette(pal: Palette): StringPalette {
  return {
    ...pal,
    background: pal.background.toString(),
    colors: pal.colors.map((x) => ({
      tags: x.tags,
      color: x.toString(),
    })),
  };
}

function deserializePalette(pal: StringPalette): Palette {
  return {
    ...pal,
    background: Color.colorFromString(pal.background, pal.colorSpace),
    colors: pal.colors.map((x) => {
      if (typeof x === "string") {
        const color = Color.colorFromString(x, pal.colorSpace);
        color.tags = [];
        return color;
      }
      const color = Color.colorFromString(x.color, pal.colorSpace);
      color.tags = x.tags;
      return color;
    }),
  };
}

function serializeStore(store: StoreData) {
  return {
    ...store,
    lints: store.lints.map((x) => {
      delete x.customProgram;
      return {
        ...x,
        expectedFailingTests: (x.expectedFailingTests || []).map(
          serializePalette
        ),
        expectedPassingTests: (x.expectedPassingTests || []).map(
          serializePalette
        ),
      };
    }),
  };
}
function deserializeStore(store: any) {
  return {
    ...store,
    lints: store.lints.map((x: any) => ({
      requiredTags: [],
      taskTypes: [],
      ...x,
      expectedFailingTests: (x.expectedFailingTests || []).map(
        deserializePalette
      ),
      expectedPassingTests: (x.expectedPassingTests || []).map(
        deserializePalette
      ),
    })),
  };
}

// install defaults if not present
function addDefaults(store: Partial<StorageData>): StorageData {
  // check if the base store objects work right
  const storeData = { ...InitialStore, ...store };

  return storeData as StorageData;
}

const storeName = "lil-buddy-store";
function createStore() {
  const target =
    localStorage.getItem(storeName) || JSON.stringify(InitialStore);
  let storeData: StoreData = deserializeStore(addDefaults(JSON.parse(target)));

  // persist new store to storage
  localStorage.setItem(storeName, JSON.stringify(deserializeStore(storeData)));
  // create store
  const { subscribe, set, update } = writable<StoreData>(storeData);
  let undoStack: StoreData[] = [];
  let redoStack: StoreData[] = [];
  // special logic to enable not capturing too many steps via dragging
  let pausePersistance = false;
  let lastStore: StoreData = storeData;
  const save = (store: StoreData) =>
    localStorage.setItem(storeName, JSON.stringify(serializeStore(store)));

  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      if (pausePersistance) {
        lastStore = oldStore;
        return updateFunc(oldStore);
      }
      undoStack.push(oldStore);
      redoStack = [];
      const newVal: StoreData = updateFunc(oldStore);
      save(newVal);
      return newVal;
    });

  const lintUpdate = (updateFunc: (old: LintProgram) => LintProgram) =>
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

  const simpleUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => updateFunc(oldStore));

  const saveUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal = updateFunc(oldStore);
      save(newVal);
      return newVal;
    });

  return {
    subscribe,
    undo: () =>
      saveUpdate((currentVal) => {
        if (undoStack.length === 0) return currentVal;
        redoStack.push(currentVal);
        return undoStack.pop()!;
      }),
    redo: () =>
      saveUpdate((currentVal) => {
        if (redoStack.length === 0) return currentVal;
        undoStack.push(currentVal);
        return redoStack.pop()!;
      }),
    pausePersistance: () =>
      simpleUpdate((currentVal) => {
        lastStore = currentVal;
        undoStack.push(currentVal);
        redoStack = [];
        pausePersistance = true;
        return currentVal;
      }),
    resumePersistance: () => {
      pausePersistance = false;
      persistUpdate(() => lastStore);
      undoStack.pop();
    },
    setFocusedLint: (n: StoreData["focusedLint"]) =>
      persistUpdate((old) => ({ ...old, focusedLint: n })),
    setCurrentLintProgram: (program: string) =>
      lintUpdate((old) => ({ ...old, program })),
    setCurrentLintName: (name: string) =>
      lintUpdate((old) => ({ ...old, name })),
    setCurrentLintTaskTypes: (taskTypes: LintProgram["taskTypes"]) =>
      lintUpdate((old) => ({ ...old, taskTypes })),
    setCurrentTags: (requiredTags: string[]) =>
      lintUpdate((old) => ({ ...old, requiredTags })),
    setCurrentLintLevel: (level: "error" | "warning") =>
      lintUpdate((old) => ({ ...old, level })),
    setCurrentLintGroup: (group: LintProgram["group"]) =>
      lintUpdate((old) => ({ ...old, group })),
    setCurrentLintDescription: (description: string) =>
      lintUpdate((old) => ({ ...old, description })),
    setCurrentLintFailMessage: (failMessage: string) =>
      lintUpdate((old) => ({ ...old, failMessage })),
    setCurrentLintBlameMode: (blameMode: LintProgram["blameMode"]) =>
      lintUpdate((old) => ({ ...old, blameMode })),
    setCurrentLintExpectedFailingTests: (expectedFailingTests: Palette[]) =>
      lintUpdate((old) => ({ ...old, expectedFailingTests })),
    setCurrentLintExpectedPassingTests: (expectedPassingTests: Palette[]) =>
      lintUpdate((old) => ({ ...old, expectedPassingTests })),
    deleteLint: (id: string) =>
      persistUpdate((old) => ({
        ...old,
        lints: old.lints.filter((x) => x.id !== id),
      })),
    createNewLint: (newLintFrag: Partial<LintProgram>) =>
      persistUpdate((old) => {
        const newBuiltLint = newLint(newLintFrag);

        return {
          ...old,
          focusedLint: newBuiltLint.id,
          lints: [...old.lints, newBuiltLint],
        };
      }),
    cloneLint: (id: string, newId: string) =>
      persistUpdate((old) => {
        const lint = old.lints.find((x) => x.id === id);
        if (!lint) {
          return old;
        }
        return {
          ...old,
          lints: [...old.lints, { ...lint, id: newId }],
        };
      }),
    postCurrentChecks: (checks: LintResult[]) =>
      persistUpdate((old) => ({
        ...old,
        currentChecks: checks,
        loadState: "idle",
      })),
    setLoadState: (state: StoreData["loadState"]) =>
      persistUpdate((old) => ({ ...old, loadState: state })),
    setEngine: (engine: StoreData["engine"]) =>
      persistUpdate((old) => ({ ...old, engine })),
  };
}

const store = createStore();

export default store;
