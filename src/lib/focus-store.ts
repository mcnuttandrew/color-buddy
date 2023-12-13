import { writable } from "svelte/store";

interface StoreData {
  focusedColor: string | undefined;
}

const InitialStore: StoreData = {
  focusedColor: undefined,
};

function createStore() {
  const { subscribe, set, update } = writable<StoreData>(InitialStore);
  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => updateFunc(oldStore));

  const simpleSet = (key: keyof StoreData) => (val: any) =>
    persistUpdate((n) => ({ ...n, [key]: val }));

  return {
    subscribe,
    setFocusedColor: simpleSet("focusedColor"),
    reset: () => set({ ...InitialStore }),
  };
}

const store = createStore();

export default store;
