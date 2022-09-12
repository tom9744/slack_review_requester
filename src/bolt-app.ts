import { App, ExpressReceiver } from "@slack/bolt";
import e, { Application } from "express";
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
      async ({ ack, view, body, client, logger }) => {
        await ack();

        const inputValueList = REVIEW_REQUEST_MODAL.blocks.reduce<{
          [key: string]: any;
        }>((acc, { block_id, element }) => {
          const viewStateValue = view.state.values[block_id][element.action_id];
          const key = block_id
            .split("_")
            .map((string, index) => {
              if (index === 0) {
                return string;
              }
              return string.charAt(0).toUpperCase() + string.slice(1);
            })
            .join("");

          switch (viewStateValue.type) {
            case "multi_users_select":
              acc[key] = viewStateValue.selected_users;
              return acc;
            case "static_select":
              acc[key] = viewStateValue.selected_option?.value;
              return acc;
            case "plain_text_input":
              acc[key] = viewStateValue.value;
              return acc;
            default:
              return acc;
          }
        }, {});

        const message = generateReviewRequest({
          author: body.user.id,
          reviewerList: inputValueList["reviewerList"],
          workSummary: inputValueList["workSummary"],
          dueTime: inputValueList["dueTime"],
          mergeRequestUrl: inputValueList["mergeRequestUrl"],
          estimatedTime: inputValueList["estimatedTime"],
          cherryPick: inputValueList["cherryPick"],
        });

        // Message the user
        try {
          await client.chat.postMessage(message);
          logger.info(message);
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
