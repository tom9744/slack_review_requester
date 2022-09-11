import { App, ExpressReceiver } from "@slack/bolt";
import { Application } from "express";
import { REVIEW_REQUEST_MODAL } from "./constants/modal-schema";
import { generateReviewRequest } from "./services/review-request-generator";

export interface SlackBolt {
  app: Application;
}

class SlackBoltImpl implements SlackBolt {
  private readonly _boltApp: App;
  private readonly _expressReceiver: ExpressReceiver;

  get app(): Application {
    return this._expressReceiver.app;
  }

  constructor() {
    const receiver = new ExpressReceiver({
      signingSecret: process.env.SLACK_SIGNING_SECRET ?? "",
      endpoints: "/",
    });

    this._boltApp = new App({
      appToken: process.env.SLACK_APP_TOKEN ?? "",
      token: process.env.SLACK_BOT_TOKEN ?? "",
      receiver,
    });
    this._expressReceiver = receiver;

    this._boltApp.event("app_mention", async ({ event, client }) => {
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
              elements: [
                { type: "mrkdwn", text: "긁적...아직 못 만들었습니다." },
              ],
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

    this._boltApp.action("button_click", async ({ body, ack, say }) => {
      await ack();

      try {
        await say(`일해라, <@U0268V06F5M>!`);
      } catch (error) {
        console.error(error);
      }
    });

    this._boltApp.command(
      "/review-request",
      async ({ ack, body, client, logger }) => {
        await ack();

        try {
          // Call views.open with the built-in client
          const viewOpenResult = await client.views.open({
            trigger_id: body.trigger_id, // Pass a valid trigger_id within 3 seconds of receiving it
            view: REVIEW_REQUEST_MODAL, // View payload
          });
          logger.info(viewOpenResult);
        } catch (error) {
          logger.error(error);
        }
      }
    );

    this._boltApp.view(
      "new_review_request",
      async ({ ack, body, client, logger }) => {
        await ack();

        const message = generateReviewRequest({
          authorID: body.user.id,
          reviewerIDList: ["U0268V06F5M"],
          workSummary: "테스트",
          dueTime: "EOD",
          mergeRequestURL:
            "https://git.projectbro.com/bro/Tsl_server/-/merge_requests/30451",
        });

        // Message the user
        try {
          await client.chat.postMessage(message);
        } catch (error) {
          logger.error(error);
        }
      }
    );
  }
}

export const generateSlackBolt = (): SlackBolt => {
  return new SlackBoltImpl();
};
