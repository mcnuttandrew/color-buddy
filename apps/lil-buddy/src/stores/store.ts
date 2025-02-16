import { Color } from "color-buddy-palette";
import { writable } from "svelte/store";
import type { LintResult, LintProgram } from "color-buddy-palette-lint";
import { PREBUILT_LINTS } from "color-buddy-palette-lint";
import type { Palette } from "color-buddy-palette";
import {
  newLint,
  colorPalToStringPal,
  stringPalToColorPal,
} from "../lib/utils";

interface StoreData {
  lints: LintProgram[];
  focusedLint: string | false;
  focusedTest: false | { type: "passing" | "failing"; index: number };
  currentChecks: LintResult[];
  loadState?: "loading" | "idle";
  engine: "openai" | "anthropic";
  okayToExecute: boolean;
  visualSummary: "graph-summary" | "text-program";
}

const InitialStore: StoreData = {
  lints: PREBUILT_LINTS.map((x) => {
    delete x.customProgram;
    return {
      ...x,
      expectedFailingTests: (x.expectedFailingTests || []).map(
        colorPalToStringPal
      ),
      expectedPassingTests: (x.expectedPassingTests || []).map(
        colorPalToStringPal
      ),
    };
  }) as any as LintProgram[],
  focusedLint: false,
  currentChecks: [],
  loadState: "idle",
  engine: "openai",
  focusedTest: false,
  okayToExecute: true,
  visualSummary: "graph-summary",
};

function serializeStore(store: StoreData) {
  return {
    ...store,
    lints: store.lints.map((x) => {
      delete x.customProgram;
      return {
        ...x,
        expectedFailingTests: (x.expectedFailingTests || []).map(
          colorPalToStringPal
        ),
        expectedPassingTests: (x.expectedPassingTests || []).map(
          colorPalToStringPal
        ),
      };
    }),
  };
}
function deserializeStore(store: any) {
  return {
    ...store,
    lints: store.lints.map((x: any) => ({
      ...x,
      expectedFailingTests: (x.expectedFailingTests || []).map((x) =>
        stringPalToColorPal(x)
      ),
      expectedPassingTests: (x.expectedPassingTests || []).map(
        stringPalToColorPal
      ),
    })),
  };
}

// install defaults if not present
function addDefaults(store: Partial<StoreData>): StoreData {
  // check if the base store objects work right
  const storeData = { ...InitialStore, ...store };
  return storeData as StoreData;
}

const storeName = "lil-buddy-store";
function createStore() {
  const target =
    localStorage.getItem(storeName) || JSON.stringify(InitialStore);
  let storeData: StoreData = deserializeStore(addDefaults(JSON.parse(target)));

  // persist new store to storage
  localStorage.setItem(storeName, JSON.stringify(serializeStore(storeData)));
  // create store
  const { subscribe, update } = writable<StoreData>(storeData);
  let undoStack: StoreData[] = [];
  let redoStack: StoreData[] = [];
  // special logic to enable not capturing too many steps via dragging
  let pausePersistence = false;
  let lastStore: StoreData = storeData;
  const save = (store: StoreData) =>
    localStorage.setItem(storeName, JSON.stringify(serializeStore(store)));

  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      if (pausePersistence) {
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
    pausePersistence: () =>
      simpleUpdate((currentVal) => {
        lastStore = currentVal;
        undoStack.push(currentVal);
        redoStack = [];
        pausePersistence = true;
        return currentVal;
      }),
    resumePersistence: () => {
      pausePersistence = false;
      persistUpdate(() => lastStore);
      undoStack.pop();
    },
    setFocusedLint: (n: StoreData["focusedLint"]) =>
      persistUpdate((old) => ({ ...old, focusedLint: n, focusedTest: false })),
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
    setFocusedTest: (test: StoreData["focusedTest"]) =>
      persistUpdate((old) => ({ ...old, focusedTest: test })),
    setOkayToExecute: (okay: StoreData["okayToExecute"]) =>
      persistUpdate((old) => ({ ...old, okayToExecute: okay })),
    setVisualSummary: (visualSummary: StoreData["visualSummary"]) =>
      persistUpdate((old) => ({ ...old, visualSummary })),
  };
}

const store = createStore();

export default store;
