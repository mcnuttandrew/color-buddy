import { writable } from "svelte/store";
import * as idb from "idb-keyval";

type Example = { svg: string; numColors: number };
interface StoreData {
  examples: Example[];
  sections: Record<string, boolean>;
}

const InitialStore: StoreData = {
  examples: [],
  sections: {
    pages: true,
    ordinal: true,
    categorical: true,
    custom: true,
  },
};

const storeName = "color-pal-examples";
function createStore() {
  const storeData: StoreData = JSON.parse(JSON.stringify(InitialStore));

  const { subscribe, set, update } = writable<StoreData>(storeData);
  idb.get(storeName).then((x) => {
    if (x) set(x);
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
