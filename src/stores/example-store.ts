import { writable } from "svelte/store";
import * as idb from "idb-keyval";

type Example = { svg: string; numColors: number };
interface StoreData {
  examples: Example[];
  sections: typeof InitialSections;
}
const InitialSections = {
  pages: true,
  ordinal: true,
  categorical: true,
  custom: true,
  swatches: true,
};
const InitialStore: StoreData = {
  examples: [],
  sections: InitialSections,
};

const storeName = "color-pal-examples";
function createStore() {
  let storeData: StoreData = JSON.parse(JSON.stringify(InitialStore));

  const { subscribe, set, update } = writable<StoreData>(storeData);
  idb.get(storeName).then((x) => {
    if (x) {
      const newStore = {
        ...InitialStore,
        ...x,
        sections: { ...InitialSections, ...(x.sections || {}) },
      };
      set(newStore);
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
    toggleSection: (section: keyof typeof InitialSections) =>
      persistUpdate((old) => ({
        ...old,
        sections: { ...old.sections, [section]: !old.sections[section] },
      })),
    updateExample: (example: Example, idx: number) =>
      persistUpdate((old) => {
        const newExamples = [...old.examples];
        newExamples[idx] = example;
        return { ...old, examples: newExamples };
      }),
    deleteExample: (idx: number) =>
      persistUpdate((old) => ({
        ...old,
        examples: [...old.examples].filter((_, i) => i !== idx),
      })),
    addExample: (example: Example) =>
      persistUpdate((old) => {
        return { ...old, examples: [...old.examples, example] };
      }),
  };
}

const store = createStore();

export default store;
