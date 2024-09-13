import { writable } from "svelte/store";
import * as idb from "idb-keyval";
import type { LintResult, LintProgram } from "color-buddy-palette-lint";
import { PREBUILT_LINTS } from "color-buddy-palette-lint";
import { Color } from "color-buddy-palette";
import type { Palette, StringPalette } from "color-buddy-palette";
import { JSONStringify } from "../lib/utils";
import { loadLints } from "../lib/api-calls";

interface StoreData {
  lints: LintProgram[];
  focusedLint: string | false;
  currentChecks: LintResult[];
  loadState?: "loading" | "idle";
}

const InitialStore: StoreData = {
  lints: [],
  focusedLint: false,
  currentChecks: [],
  loadState: "idle",
};

const builtInIndex = PREBUILT_LINTS.reduce(
  (acc, x) => {
    acc[x.id] = x;
    return acc;
  },
  {} as Record<string, LintProgram>
);

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

const storeName = "color-pal-lints";
function createStore() {
  let storeData: StoreData = JSON.parse(JSON.stringify(InitialStore));
  // turn on the web worker and load whatever lints are in the store
  loadLints();

  const { subscribe, set, update } = writable<StoreData>(storeData);
  idb.get(storeName).then((x) => {
    let storeBase = deserializeStore({ ...InitialStore, ...x });
    let lints = (storeBase.lints || []) as LintProgram[];
    // force-ably set lints to defaults
    // TODO turn off for release...
    lints = lints.map(
      (x: LintProgram) => builtInIndex[x.id] || x
    ) as LintProgram[];
    const missingBuiltIns = PREBUILT_LINTS.filter(
      (x) => !lints.find((y) => y.id === x.id)
    ).map((x) => ({
      ...x,
      expectedFailingTests: [],
      expectedPassingTests: [],
    }));
    const newStore: StoreData = {
      ...storeBase,
      lints: [...lints, ...missingBuiltIns],
    };
    set(newStore);
    idb.set(storeName, serializeStore(newStore));
  });
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal: StoreData = updateFunc(oldStore);
      idb.set(storeName, serializeStore(newVal)).then(() => {
        loadLints();
      });
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
  };
}

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
    program: JSONStringify("{}"),
    requiredTags: [],
    taskTypes: ["categorical", "sequential", "diverging"],
    ...newLintFrag,
  };
}

const store = createStore();

export default store;
