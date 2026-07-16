import OpenAI from "openai";
import { openAIClient } from "./client";

export type OpenAIMessageType = {
  role: "user" | "assistant";
  content: string;
};

export type OpenAIConversationType = OpenAIMessageType[];

export const callChatGPT = async (conversation: OpenAIConversationType) => {
  try {
    const systemPrompt =
      process.env.OPENAI_SYSTEM_PROMPT ||
      "You are a helpful assistant. Please answer the following questions.";
    const openAiModelName = process.env.OPENAI_MODEL_NAME || "gpt-3.5";

    const completion = await openAIClient.chat.completions.create({
      model: openAiModelName,
      messages: [{ role: "system", content: systemPrompt }, ...conversation],
    });
    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    if (error instanceof OpenAI.APIError) {
      console.error(error.status, error.error);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
    }
    return "error occurred";
  }
};
