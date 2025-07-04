import { AppMentionEvent, KnownEventFromType, SayFn } from "@slack/bolt";
import { MessageElement } from "@slack/web-api/dist/response/ConversationsRepliesResponse";
import { app } from "./client";
import { callChatGPT } from "../openai";
import {
  OpenAIConversationType,
  OpenAIMessageType,
} from "../openai/interaction";

const retrieveConversations = async (
  event: AppMentionEvent | KnownEventFromType<"message">
): Promise<OpenAIConversationType> => {
  const sortByTs = (a: MessageElement, b: MessageElement) => {
    if (a.ts === undefined || b.ts === undefined) {
      return 0;
    }
    return Number(a.ts) - Number(b.ts);
  };

  const mapByRole = (message: MessageElement): OpenAIMessageType => {
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
  event: AppMentionEvent | KnownEventFromType<"message">
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

  await app.client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.ts,
    text: responseText,
  });
};

export const messageEventHandler = async ({
  event,
}: {
  event: KnownEventFromType<"message">;
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
      !conversations[conversations.length - 1].content.includes(
        `<@${process.env.SLACK_BOT_ID}>`
      )
    );
  };

  // Reply to thread messages for bot in a public/private channel or in DM/multiparty DM
  // (this case is when the user started to talk to the bot with @mention, and does not include @mention in the current message)
  const shouldReplyToCurrentNotMentionedMessage =
    (await isFirstMessageIncludeMentionToBot(event)) &&
    (await isCurrentMessageNotIncludeMentionToBot(event));
  if (shouldReplyToCurrentNotMentionedMessage) {
    console.log(
      "*** message was replied in messageEventHandler, for inside thread message"
    );
    return await reply(event);
  }

  // Reply to first messages in DM to the bot whether the user includes @mention or not
  const shouldReplyToDM = event.channel_type === "im";
  if (shouldReplyToDM) {
    console.log("*** message was replied in messageEventHandler, for DM");
    return await reply(event);
  }

  console.log("*** message was not replied in messageEventHandler");
};

// Reply to @mention messages to the bot
// (this case is when the user is talking to the bot with @mention in a public/private channel or in multiparty DM)
export const appMentionEventHandler = async ({
  event,
}: {
  event: AppMentionEvent;
}) => {
  console.log("*** message was replied in appMentionEventHandler");
  await reply(event);
};
