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

const FRONTEND_MR_CHNNEL_ID = "C040AM5Q198";

export const generateReviewRequest = (
  args: ReviewRequestArgs
): ChatPostMessageArguments => {
  console.log("args", args);

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
            type: "button",
            text: { type: "plain_text", text: "리뷰 완료" },
            style: "primary",
            action_id: "review_done",
          },
        ],
      },
    ],
  };
};
