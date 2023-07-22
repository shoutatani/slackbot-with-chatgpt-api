import * as EventHandlers from "./slack";
import { app } from "./slack";

app.message(EventHandlers.messageEventHandler);

app.event("app_mention", EventHandlers.appMentionEventHandler);

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
