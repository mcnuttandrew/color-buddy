import { genericHandler } from "../utils";

const prompt = (pal: string) => `
You are a color expert. You make great suggestions on colors to add to color palettes. You take in a list of colors presented as hex code and return an array of colors that could be added. Your suggestions should enhance the palette.

Present your names a list of JSON strings. They should have a type like string[]. Only respond with one array. Do not offer any other response

Palette: ${pal}
Your response: \`\`\`json`;

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
