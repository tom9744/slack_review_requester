import { ChatPostMessageArguments } from "@slack/web-api";

type DueTime = "ASAP" | "EOD" | "TOMORROW" | "THIS WEEK" | "IDC";

interface ReviewRequestArgs {
  authorID: string;
  reviewerIDList: string[];
  workSummary: string;
  mergeRequestURL: `https://git.projectbro.com/bro/Tsl_server/-/merge_requests/${number}`;
  dueTime: DueTime;
  etc?: string;
  cherryPickBranch?: string;
}

const FRONTEND_MR_CHNNEL_ID = "C040AM5Q198";

export const generateReviewRequest = (
  args: ReviewRequestArgs
): ChatPostMessageArguments => {
  const { etc = "-", cherryPickBranch = "-" } = args;

  return {
    channel: FRONTEND_MR_CHNNEL_ID,
    text: "리뷰 요청",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "<@" + args.authorID + "> 님이 리뷰를 요청했습니다.",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*리뷰어*\n" + `${args.reviewerIDList.map((id) => `<@${id}>, `)}`,
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
            text: "*예상 소요 시간*\n" + etc,
          },
          {
            type: "mrkdwn",
            text: "*체리픽*\n" + `\`${cherryPickBranch}\``,
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
            value: "review_done",
          },
        ],
      },
    ],
  };
};
