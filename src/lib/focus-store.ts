import { writable } from "svelte/store";

interface StoreData {
  focusedColors: number[];
}

const InitialStore: StoreData = {
  focusedColors: [],
};

function createStore() {
  const { subscribe, set, update } = writable<StoreData>(InitialStore);
  const simpleUpdate = (updateFunc: (old: number[]) => number[]) =>
    update((oldStore) => ({
      ...oldStore,
      focusedColors: updateFunc(oldStore.focusedColors),
    }));
  return {
    subscribe,
    toggleColor: (val: number) =>
      simpleUpdate((colors) =>
        colors.includes(val)
          ? colors.filter((x) => x !== val)
          : [...colors, val]
      ),
    setColors: (val: number[]) => simpleUpdate(() => val),
    addColor: (val: number) => simpleUpdate((colors) => [...colors, val]),
    removeColor: (val: number) =>
      simpleUpdate((colors) => colors.filter((x) => x !== val)),
    clearColors: () => simpleUpdate(() => []),
    reset: () => set({ ...InitialStore }),
  };
}

const store = createStore();

export default store;
