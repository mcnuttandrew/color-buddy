import { writable } from "svelte/store";

interface StoreData {
  focusedColor: number | undefined;
}

const InitialStore: StoreData = {
  focusedColor: undefined,
};

function createStore() {
  const { subscribe, set, update } = writable<StoreData>(InitialStore);
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => updateFunc(oldStore));

  return {
    subscribe,
    setFocusedColor: (val: number | undefined) =>
      persistUpdate((n) => ({ ...n, focusedColor: val })),
    reset: () => set({ ...InitialStore }),
  };
}

const store = createStore();

export default store;
