import { AppMentionEvent, KnownEventFromType, SayFn } from "@slack/bolt";
import { Message } from "@slack/web-api/dist/response/ConversationsRepliesResponse";
import { app } from "./client";
import { callChatGPT } from "../openai";
import {
  OpenAIConversationType,
  OpenAIMessageType,
} from "../openai/interaction";

const retrieveConversations = async (
  event: AppMentionEvent | KnownEventFromType<"message">
): Promise<OpenAIConversationType> => {
  const sortByTs = (a: Message, b: Message) => {
    if (a.ts === undefined || b.ts === undefined) {
      return 0;
    }
    return Number(a.ts) - Number(b.ts);
  };

  const mapByRole = (message: Message): OpenAIMessageType => {
    if (message.bot_profile) {
      return {
        role: "assistant",
        content: message.text || "",
      };
    }
    return {
      role: "user",
      content: message.text || "",
    };
  };

  if (event.subtype !== undefined) {
    return [];
  }
  if (event.thread_ts) {
    const thread_messages = await app.client.conversations.replies({
      token: process.env.SLACK_BOT_TOKEN,
      channel: event.channel,
      ts: event.thread_ts,
    });
    if (thread_messages.ok && thread_messages.messages !== undefined) {
      const conversations = thread_messages.messages
        .sort(sortByTs)
        .map(mapByRole);
      return conversations;
    }
  }

  return [
    {
      role: "user",
      content: event.text || "",
    },
  ];
};

const reply = async (
  event: AppMentionEvent | KnownEventFromType<"message">,
  say: SayFn
) => {
  const createConversation = async (
    event: AppMentionEvent | KnownEventFromType<"message">
  ): Promise<OpenAIConversationType> => {
    const removeUserIdentifier = (text?: string) => {
      return text?.replace(/<@U[A-Z0-9]+>/g, "")?.trim() || "";
    };

    return (await retrieveConversations(event)).map((m) => ({
      role: m.role,
      content: removeUserIdentifier(m.content),
    }));
  };

  const conversation = await createConversation(event);

  const responseText = await callChatGPT(conversation);

  await say({
    text: responseText,
    thread_ts: event.ts,
  });
};

export const messageEventHandler = async ({
  event,
  say,
  message,
}: {
  event: KnownEventFromType<"message">;
  say: SayFn;
  message: KnownEventFromType<"message">;
}) => {
  const isFirstMessageIncludeMentionToBot = async (
    event: KnownEventFromType<"message">
  ) => {
    const conversations = await retrieveConversations(event);
    if (conversations.length === 0) {
      return false;
    }
    return (
      conversations[0]?.role === "user" &&
      conversations[0]?.content?.includes(`<@${process.env.SLACK_BOT_ID}>`)
    );
  };

  const isCurrentMessageNotIncludeMentionToBot = async (
    event: KnownEventFromType<"message">
  ) => {
    const conversations = await retrieveConversations(event);
    if (conversations.length === 0) {
      return false;
    }
    return (
      conversations[conversations.length - 1].role === "user" &&
      !conversations[conversations.length - 1].content.includes(`<@`)
    );
  };

  // slack botが参加しているチャンネルで、@メンションがなくてもスレッドの先頭のメッセージに@メンションがつく場合に応答する
  const shouldReply =
    (await isFirstMessageIncludeMentionToBot(event)) &&
    (await isCurrentMessageNotIncludeMentionToBot(event));
  if (shouldReply) {
    reply(event, say);
  }

  // DMでのメッセージに応答する
  if (message.channel_type === "im" && message.subtype === undefined) {
    reply(message, say);
  }
};

// 公開チャンネルでの@メンションに応答する
export const appMentionEventHandler = async ({
  event,
  say,
}: {
  event: AppMentionEvent;
  say: SayFn;
}) => {
  reply(event, say);
};