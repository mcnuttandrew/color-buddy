import OpenAI from "openai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

const engines = {
  google: (prompt: string) => model.generateContent(prompt),
  openai: (prompt: string) =>
    openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      // model: "gpt-4",
    }),
};

export const genericHandler =
  <A>(engine: keyof typeof engines) =>
  (prompt: (input: A) => string, bodyGetter: (string) => A) =>
  async (event, _context, callback) => {
    let promptInput;
    try {
      promptInput = bodyGetter(event.body);
    } catch (e) {
      console.log(e);
      errorResponse(callback, "Bad submit");
      return;
    }
    const content = prompt(promptInput);
    console.log(content);
    const result = await engines[engine](content);
    callback(null, { statusCode: 200, body: JSON.stringify(result) });
  };
