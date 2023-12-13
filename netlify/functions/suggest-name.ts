import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function errorResponse(callback, err) {
  console.error(err);

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({ error: err }),
  });
}

const prompt = (pal: string) => `
You are a color expert. You know how to beautifully put a name to a list of colors presented as hex code. 

Present your names a list of JSON strings. They should have a type like string[].

Palette: ${pal}
Your response:`;
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
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt(JSON.stringify(inputColors)) }],
    model: "gpt-3.5-turbo",
  });
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(chatCompletion),
  });
};
