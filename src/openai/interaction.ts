import { openAIClient } from "./client";

export type OpenAIMessageType = {
  role: "user" | "assistant";
  content: string;
};

export type OpenAIConversationType = OpenAIMessageType[];

export const callChatGPT = async (conversation: OpenAIConversationType) => {
  try {
    const completion = await openAIClient.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: "あなたはWebアプリケーション開発者です" },
        ...conversation,
      ],
    });
    return completion.data?.choices[0]?.message?.content || "";
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
    }
    return "エラーが発生しました";
  }
};
