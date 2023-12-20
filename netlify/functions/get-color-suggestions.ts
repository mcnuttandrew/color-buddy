import { genericHandler } from "../utils";

type promptInput = { inputColors: string[]; background: string; name: string };
const prompt = (pal: promptInput) => {
  const result = `
You are a color expert. You make great suggestions on colors to add to color palettes. You take in a list of colors presented as hex code and return an array of colors that could be added. Your suggestions should enhance the palette.

Present your names a list of JSON strings. They should have a type like string[]. Only respond with one array. Do not offer any other response

Palette Name: ${pal.name}
Palette: ${JSON.stringify(pal.inputColors)}
Background Color: ${pal.background}
Your response: \`\`\`json`;
  return result;
};

export const handler = genericHandler<promptInput>(prompt, (x) => {
  const input = JSON.parse(x);
  const inputColors = input.colors;
  if (
    !Array.isArray(inputColors) ||
    !inputColors.every((x) => typeof x === "string")
  ) {
    throw new Error("Not an array");
  }
  const background = input.background;
  if (typeof background !== "string") {
    throw new Error("No background");
  }

  const name = input.name;
  if (typeof name !== "string") {
    throw new Error("No name");
  }

  return { inputColors, background };
});
