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

    const completion = await openAIClient.createChatCompletion({
      model: openAiModelName,
      messages: [{ role: "system", content: systemPrompt }, ...conversation],
    });
    return completion.data?.choices[0]?.message?.content || "";
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
    }
    return "error occurred";
  }
};
