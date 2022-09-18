import { ChatPostMessageArguments } from "@slack/web-api";

type DueTime = "ASAP" | "EOD" | "TOMORROW" | "THIS WEEK" | "IDC";

interface ReviewRequestArgs {
  author: string;
  reviewerList: string[];
  workSummary: string;
  mergeRequestUrl: string;
  dueTime: DueTime;
  estimatedTime?: string;
  cherryPick?: string;
}

// TODO: DEV, PROD 환경 변수로 적용
const LAB_CHANNEL_ID = "C040AM5Q198";
const FRONTEND_MR_CHNNEL_ID = "C03RBJ56MUN";

export enum ActionID {
  ReviewDone = "review_done",
  OpenMergeRequest = "open_merge_request",
}

export const generateReviewRequest = (
  args: ReviewRequestArgs
): ChatPostMessageArguments => {
  return {
    channel: FRONTEND_MR_CHNNEL_ID,
    text: "리뷰 요청",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "<@" + args.author + "> 님이 리뷰를 요청했습니다.",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*리뷰어*\n" + `${args.reviewerList.map((id) => `<@${id}> `)}`,
        },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*작업내용*\n" + args.workSummary },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*리뷰 기한*\n" + args.dueTime },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text:
              "*예상 소요 시간*\n" +
              (args.estimatedTime ? args.estimatedTime : "-"),
          },
          {
            type: "mrkdwn",
            text: "*체리픽*\n" + (args.cherryPick ? args.cherryPick : "-"),
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            action_id: ActionID.ReviewDone,
            type: "button",
            text: { type: "plain_text", text: "리뷰 완료" },
            style: "primary",
          },
          {
            action_id: ActionID.OpenMergeRequest,
            type: "button",
            text: { type: "plain_text", text: "MR 보기" },
            url: args.mergeRequestUrl,
          },
        ],
      },
    ],
  };
};
