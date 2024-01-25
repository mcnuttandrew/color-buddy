import { genericHandler } from "../utils";

type promptInput = { textPrompt: string };
const prompt = (pal: promptInput) => `
You are a color palette design expert. You take in a text prompt for a color palette and return a color palette. 

For example:
Prompt: "Color Wheel Basics"
Output: {
    "colors": ["#000000", "#FF0000", "#00FF00", "#0000FF"]
    "background": "#FFFFFF"
}

Present your responses as an array of json objects. They should have a types like {"colors": string[]; "background": string}. Only respond with palettes fitting the prompt. Do not offer any other response.

Prompt: ${JSON.stringify(pal.textPrompt)}
Your response: `;

export const handler = genericHandler<promptInput>(prompt, (x) => {
  // TODO sanitize for prompt injection

  const input = JSON.parse(x);
  const textPrompt = input.prompt;
  if (typeof textPrompt !== "string") {
    throw new Error("Invalid prompt");
  }
  return { textPrompt };
});
