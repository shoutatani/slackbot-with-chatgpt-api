import { app, awsLambdaReceiver } from "./client";
import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from "@aws-sdk/client-lambda";
import { KnownEventFromType, AppMentionEvent, Context } from "@slack/bolt";
import { APIGatewayEvent, APIGatewayProxyCallback } from "aws-lambda";
export { awsLambdaReceiver } from "./client";

const MESSAGE_HANDLER_NAME = process.env.MESSAGE_HANDLER_NAME || "";

// Reply to messages for bot without @mention
const messageEventInvoker = async ({
  event,
}: {
  event: KnownEventFromType<"message">;
}) => {
  const client = new LambdaClient({ region: "ap-northeast-1" });
  const input = {
    FunctionName: MESSAGE_HANDLER_NAME,
    InvocationType: InvocationType.Event,
    Payload: JSON.stringify({ type: "message", event }),
  };
  const command = new InvokeCommand(input);
  console.info("*** slack/app.messageEventInvoker called");
  await client.send(command);
};

// Reply to messages for bot with @mention
const appMentionEventInvoker = async ({
  event,
}: {
  event: AppMentionEvent;
}) => {
  const client = new LambdaClient({ region: "ap-northeast-1" });
  const input = {
    FunctionName: MESSAGE_HANDLER_NAME,
    InvocationType: InvocationType.Event,
    Payload: JSON.stringify({ type: "appMention", event }),
  };
  const command = new InvokeCommand(input);
  console.info("*** slack/app.appMentionEventInvoker called");
  await client.send(command);
};

app.message(messageEventInvoker);

app.event("app_mention", appMentionEventInvoker);

export const handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  console.info("*** webhookHandler called");
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
