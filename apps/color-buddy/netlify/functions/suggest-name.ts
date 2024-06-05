import { genericHandler } from "../utils";

type promptInput = { inputColors: string[]; background: string };
const prompt = (pal: promptInput) => `
You are a color expert. You expertly name color palettes. You take in a list of colors presented as hex code and return a name for the palette.
Present your names a list of JSON strings. They should have a type like string[]. Only respond with one array consisting of 4 name suggestions. Do not offer any other response.
Palette: ${JSON.stringify(pal.inputColors)}
Background Color: ${pal.background}
Your response: `;
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
  return { inputColors, background };
});
