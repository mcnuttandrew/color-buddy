import { genericHandler } from "../utils";

type promptInput = { textPrompt: string };
const prompt = (pal: promptInput) => `
You are a color expert. You take in a prompt for a color palette and return the contents of the palette.

For example:
Prompt: "Color Wheel Basics"
Output: {
    "colors": ["#000000", "#FF0000", "#00FF00", "#0000FF"]
    "background": "#FFFFFF"
}

Present your names a list of JSON strings. They should have a type like {"colors": string[]; "background": string}. Only respond with a palette fitting the prompt. Do not offer any other response.

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
