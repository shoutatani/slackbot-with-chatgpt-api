import { KnownEventFromType } from "@slack/bolt";
import { AppMentionEvent } from "@slack/types";
import { APIGatewayProxyHandler, APIGatewayEvent } from "aws-lambda";
import {
  appMentionEventHandler,
  messageEventHandler,
} from "./slack/eventHandlers";

type PayloadType =
  | {
      type: "appMention";
      event: AppMentionEvent;
    }
  | {
      type: "message";
      event: KnownEventFromType<"message">;
    };

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
) => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }
  const payload: PayloadType = event as unknown as PayloadType;

  if (payload.type === "appMention") {
    const { event } = payload;
    await appMentionEventHandler({ event });
  }

  if (payload.type === "message") {
    const { event } = payload;
    await messageEventHandler({ event });
  }

  const response = {
    statusCode: 200,
    body: "",
  };
  return response;
};
