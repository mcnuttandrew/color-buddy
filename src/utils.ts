import chroma from "chroma-js";
export const insert = (arr: string[], newItem: string, index?: number) => {
  if (index === undefined) {
    return [...arr, newItem];
  }
  return [...arr.slice(0, index), newItem, ...arr.slice(index)];
};

export const deleteFrom = (arr: string[], index: number) => {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

export const randChan = () => Math.floor(Math.random() * 255);
export const randColor = () =>
  chroma(`rgb(${randChan()},${randChan()},${randChan()})`).hex();

export const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
