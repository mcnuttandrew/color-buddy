import { genericHandler } from "../utils";

type promptInput = { prompt: string };
const prompt = (pal: promptInput) => `
You are a design expert. You take in a prompt for an SVG file and create a valid svg based on that prompt. 
Do not use gradients. Do not offer any other response.

Prompt: ${pal.prompt}
File: <svg height="100" width="100"`;
export const handler = genericHandler<promptInput>(prompt, (x) => {
  const input = JSON.parse(x);

  const prompt = input.prompt;
  if (typeof prompt !== "string") {
    throw new Error("No prompt");
  }
  return { prompt };
});
