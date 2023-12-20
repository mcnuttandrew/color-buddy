import { genericHandler } from "../utils";

type promptInput = {
  inputColors: string[];
  background: string;
  prompt: string;
};
const prompt = (pal: promptInput) => `
You are a color expert. You take in a color palette and make requested modifications to it. 

For example:
Palette: ["#000000", "#FF0000", "#00FF00", "#0000FF"]
Background Color: "#FFFFFF" 
Prompt: "Make the colors more pastel."
Output: {"background": "#FFFFFF", "colors": ["#9E9E9E", "#F8BBD0", "#D3EC8A", "#D3D3FF"]}

Present your names a single JSON object. It should have a type like {"background: string; colors: string[]}. It should have exactly the same number of colors as the input. Do not offer any other response.

Palette: ${JSON.stringify(pal.inputColors)}
Background Color: ${JSON.stringify(pal.background)}
Prompt: ${JSON.stringify(pal.prompt)}
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
  const prompt = input.prompt;
  if (typeof prompt !== "string") {
    throw new Error("No prompt");
  }
  return { inputColors, background, prompt };
});
