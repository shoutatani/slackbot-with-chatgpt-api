import { app } from "./slack/client";
import {
  appMentionEventHandler,
  messageEventHandler,
} from "./slack/eventHandlers";

app.message(messageEventHandler);

app.event("app_mention", appMentionEventHandler);

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
