import { app, awsLambdaReceiver } from "./client";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { KnownEventFromType, AppMentionEvent, Context } from "@slack/bolt";
import { APIGatewayEvent, APIGatewayProxyCallback } from "aws-lambda";
export { awsLambdaReceiver } from "./client";

const ENV = process.env.ENV || "stg";

// DMでのメッセージや、@メンションがなくてもbot宛てのメッセージと思われるものに応答する
const messageEventInvoker = async ({
  event,
}: {
  event: KnownEventFromType<"message">;
}) => {
  const client = new LambdaClient({ region: "ap-northeast-1" });
  const input = {
    FunctionName: `slackbot-with-chatgpt-api-${ENV}-messageHandler`,
    InvocationType: "Event",
    Payload: JSON.stringify({ type: "message", event }),
  };
  const command = new InvokeCommand(input);
  console.log("********slack/app.messageEventInvoker called");
  await client.send(command);
};

// 公開チャンネルでの@メンションに応答する
const appMentionEventInvoker = async ({
  event,
}: {
  event: AppMentionEvent;
}) => {
  const client = new LambdaClient({ region: "ap-northeast-1" });
  const input = {
    FunctionName: `slackbot-with-chatgpt-api-${ENV}-messageHandler`,
    InvocationType: "Event",
    Payload: JSON.stringify({ type: "appMention", event }),
  };
  const command = new InvokeCommand(input);
  console.log("********slack/app.appMentionEventInvoker called");
  await client.send(command);
};

app.message(messageEventInvoker);

app.event("app_mention", appMentionEventInvoker);

export const handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  console.info("********webhookHandler called");
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};