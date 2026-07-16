import OpenAI from "openai";

export const openAIClient = (() => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({ apiKey });
})();
