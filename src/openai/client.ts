import { Configuration, OpenAIApi } from "openai";

export const openAIClient = (() => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  if (!configuration.apiKey) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }
  const openai = new OpenAIApi(configuration);
  return openai;
})();
