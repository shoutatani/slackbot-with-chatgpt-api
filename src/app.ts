import * as EventHandlers from "./slack";
import { app, awsLambdaReceiver } from "./slack";
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from "aws-lambda";

app.message(EventHandlers.messageEventHandler);

app.event("app_mention", EventHandlers.appMentionEventHandler);

export const handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
