import { genericHandler } from "../utils";

const prompt = (pal: { inputColors: string[]; background: string }) => `
You are a color expert. You beautifully name color palettes. Your names should be as creative and poetic as possible. You take in a list of colors presented as hex code and return a name for the palette.

For example:
Palette: ["#000000", "#FF0000", "#00FF00", "#0000FF"]
Background Color: "#FFFFFF" 
Output: ["Color Wheel Basics", "Primary School", "RGB"]

Present your names a list of JSON strings. They should have a type like string[]. Only respond with one array. Do not offer any other response

Palette: ${JSON.stringify(pal.inputColors)}
Background Color: ${pal.background}
Your response: `;
export const handler = genericHandler("openai")(prompt, (x) => {
  const input = JSON.parse(x);
  const inputColors = input.palette;
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
