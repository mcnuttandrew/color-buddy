// import OpenAI from "openai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
console.log("my key", process.env.GEMINI_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export function errorResponse(callback, err) {
  console.error(err);

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({ error: err }),
  });
}

const prompt = (pal: string) => `
You are a color expert. You make great suggestions on colors to add to color palettes. You take in a list of colors presented as hex code and return an array of colors that could be added. Your suggestions should enhance the palette.

Present your names a list of JSON strings. They should have a type like string[]. Only respond with one array. Do not offer any other response

Palette: [#F1E7D5, #FAF9F6, #E4E7EB"]
Your response: \`\`\`json`;
export const handler = async (event, context, callback) => {
  let inputColors;
  try {
    inputColors = JSON.parse(event.body);
    if (
      !Array.isArray(inputColors) ||
      !inputColors.every((x) => typeof x === "string")
    ) {
      throw new Error("Not an array");
    }
  } catch (e) {
    errorResponse(callback, "Bad submit");
    return;
  }
  const content = prompt(JSON.stringify(inputColors));
  // const chatCompletion = await openai.chat.completions.create({
  //   messages: [{ role: "user", content }],
  //   model: "gpt-3.5-turbo",
  // });
  const result = await model.generateContent(content);
  callback(null, {
    statusCode: 200,
    // body: JSON.stringify(chatCompletion),
    body: JSON.stringify(result),
  });
};
