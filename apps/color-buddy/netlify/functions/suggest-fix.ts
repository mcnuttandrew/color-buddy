import { genericHandler } from "../utils";

type promptInput = {
  inputColors: string[];
  background: string;
  error: string;
  context: string;
};
const prompt = (pal: promptInput) => `
You are a color expert. You take in a color palette and an error it has and fix it. Your fixes should be clever but respect the original vibe of the palette. Present your fixes as a single JSON object that describes the color palette. It should have a type like {"background": string; "colors": string[]}. 
Additional criteria:
- As much as possible, do not provide fixes by simply removing a color from the palette. 
- DO NOT JUST RETURN THE SAME COLORS. That is not a fix. You must change at least one color.

Do not offer any other response. YOU MUST GIVE A VALID JSON OBJECT. If you do not, you will be banned.

Palette: ${JSON.stringify(pal.inputColors)}
Context: ${JSON.stringify(pal.context)}
Background Color: ${JSON.stringify(pal.background)}
Error: ${JSON.stringify(pal.error)}

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
  const error = input.error;
  if (typeof error !== "string") {
    throw new Error("No error");
  }
  const context = input.context;
  if (typeof context !== "string") {
    throw new Error("No context");
  }

  return { inputColors, background, error, context };
});
