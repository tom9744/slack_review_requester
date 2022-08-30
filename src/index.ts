import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { App as BoltApp, ExpressReceiver } from "@slack/bolt";

dotenv.config();

const expressApp = express();

const boltReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? "",
  endpoints: "/",
});

const boltApp = new BoltApp({
  appToken: process.env.SLACK_APP_TOKEN ?? "",
  token: process.env.SLACK_BOT_TOKEN ?? "",
  receiver: boltReceiver,
});

boltApp.event("app_mention", async ({ event, client }) => {
  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: "Review Requester Mark II",
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "*Review Requester Mark II*" },
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: "긁적...아직 못 만들었습니다." }],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "응원하기" },
              action_id: "button_click",
              value: "click me!",
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

expressApp.use("/slack/events", boltReceiver.app);

createServer(expressApp).listen(process.env.PORT ?? "3000", () => {
  console.log(
    `[LOG] Server is listening on port ${process.env.PORT ?? "3000"}`
  );
});
