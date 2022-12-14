import {
  ActionsBlock,
  App,
  BlockAction,
  ButtonAction,
  ExpressReceiver,
  SectionBlock,
  SlackAction,
} from "@slack/bolt";
import { ChatPostMessageResponse } from "@slack/web-api";
import { Application } from "express";
import { REVIEW_REQUEST_MODAL } from "./constants/modal-schema";
import {
  ActionID,
  generateReviewRequest,
} from "./services/review-request-generator";

function isButtonBlockAction(
  action: SlackAction
): action is BlockAction<ButtonAction> {
  return action.type === "block_actions" && action.actions[0].type === "button";
}

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

    this._boltApp.action(ActionID.OpenMergeRequest, async ({ ack }) => {
      await ack();
    });

    this._boltApp.action(ActionID.ReviewDone, async ({ body, client, ack }) => {
      await ack();

      if (!isButtonBlockAction(body)) {
        return;
      }

      try {
        client.chat.update({
          channel: body.channel!.id!,
          ts: body.message!.ts,
          text: `리뷰가 완료되었습니다.`,
          blocks: [
            ...(
              body.message!.blocks as Array<ActionsBlock | SectionBlock>
            ).filter((block) => block.type === "section"),
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `<@${body.user.id}> 님에 의해 완료되었습니다.`,
              },
            },
          ],
          as_user: true,
        });
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
        await ack({ response_action: "clear" });

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

        let response: ChatPostMessageResponse | null = null;

        // Message the user
        try {
          response = await client.chat.postMessage(
            generateReviewRequest({
              author: body.user.id,
              reviewerList: inputValueList["reviewerList"],
              workSummary: inputValueList["workSummary"],
              dueTime: inputValueList["dueTime"],
              mergeRequestUrl: inputValueList["mergeRequestUrl"],
              estimatedTime: inputValueList["estimatedTime"],
              cherryPick: inputValueList["cherryPick"],
            })
          );
          logger.info(response);
        } catch (error) {
          logger.error(error);
        }

        const carbonCopyList: string[] = inputValueList["carbonCopyList"];

        if (
          !response?.channel ||
          !response?.ts ||
          carbonCopyList.length === 0
        ) {
          return;
        }

        try {
          await client.chat.postMessage({
            channel: response.channel,
            thread_ts: response.ts,
            text:
              "CC. " +
              `${inputValueList["carbonCopyList"].map(
                (id: string) => `<@${id}> `
              )}`,
            mrkdwn: true,
          });
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
