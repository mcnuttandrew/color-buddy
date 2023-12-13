import { genericHandler } from "../utils";

const prompt = (pal: string) => `
You are a color expert. You beautifully name color palettes. Your names should be as creative and poetic as possible.

Present your names a list of JSON strings. They should have a type like string[]. Only respond with one array. Do not offer any other response

Palette: ${pal}
Your response:`;
export const handler = genericHandler("openai")(prompt, (x) => {
  const inputColors = JSON.parse(x);
  if (
    !Array.isArray(inputColors) ||
    !inputColors.every((x) => typeof x === "string")
  ) {
    throw new Error("Not an array");
  }
  return JSON.stringify(inputColors);
});
