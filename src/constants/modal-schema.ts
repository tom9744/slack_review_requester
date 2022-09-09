import {
  Checkboxes,
  Datepicker,
  InputBlock,
  MultiSelect,
  MultiUsersSelect,
  PlainTextInput,
  RadioButtons,
  Select,
  StaticSelect,
  Timepicker,
  View,
} from "@slack/bolt";

type InputElementType =
  | Select
  | MultiSelect
  | Datepicker
  | Timepicker
  | PlainTextInput
  | RadioButtons
  | Checkboxes;

interface TypedInputBlock<T extends InputElementType> extends InputBlock {
  element: T;
}

const REVIEWER: TypedInputBlock<MultiUsersSelect> = {
  type: "input",
  element: {
    type: "multi_users_select",
    action_id: "reviewer_select-action",
    placeholder: { type: "plain_text", text: "리뷰어를 선택하세요." },
  },
  label: { type: "plain_text", text: "누구에게 리뷰를 요청할까요?" },
};

const WORK_SUMMARY: TypedInputBlock<PlainTextInput> = {
  type: "input",
  element: {
    type: "plain_text_input",
    action_id: "work_summary_input-action",
    multiline: true,
  },
  label: { type: "plain_text", text: "작업 내용을 요약해주세요." },
};

const MR_URL: TypedInputBlock<PlainTextInput> = {
  type: "input",
  element: {
    type: "plain_text_input",
    action_id: "mr_url_input-action",
  },
  label: { type: "plain_text", text: "MR URL을 입력해주세요." },
};

const PRIORITY: TypedInputBlock<StaticSelect> = {
  type: "input",
  element: {
    type: "static_select",
    action_id: "priority_select-action",
    options: [
      {
        text: { type: "plain_text", text: "ASAP" },
        value: "ASAP",
      },
      {
        text: { type: "plain_text", text: "EOD" },
        value: "EOD",
      },
      {
        text: { type: "plain_text", text: "내일" },
        value: "내일",
      },
      {
        text: { type: "plain_text", text: "이번주" },
        value: "이번주",
      },
      {
        text: { type: "plain_text", text: "상관없음" },
        value: "상관없음",
      },
    ],
    initial_option: {
      text: { type: "plain_text", text: "내일" },
      value: "내일",
    },
  },
  label: { type: "plain_text", text: "언제까지 리뷰가 완료되면 좋을까요?" },
};

const ESTIMATED_TIME_TO_COMPLETE: TypedInputBlock<PlainTextInput> = {
  type: "input",
  element: {
    type: "plain_text_input",
    action_id: "estimated_time_to_complete-action",
  },
  label: { type: "plain_text", text: "예상되는 소요 시간은 어느 정도인가요?" },
  optional: true,
};

const CHERRY_PICK_BRANCH: TypedInputBlock<PlainTextInput> = {
  type: "input",
  element: {
    type: "plain_text_input",
    action_id: "cherry_plck_branch-action",
  },
  label: { type: "plain_text", text: "체리픽이 필요한가요?" },
  optional: true,
};

export const REVIEW_REQUEST_MODAL: View = {
  type: "modal",
  callback_id: "new_review_request",
  title: { type: "plain_text", text: "새로운 리뷰 요청" },
  blocks: [
    REVIEWER,
    WORK_SUMMARY,
    MR_URL,
    PRIORITY,
    ESTIMATED_TIME_TO_COMPLETE,
    CHERRY_PICK_BRANCH,
  ],
  submit: {
    type: "plain_text",
    text: "제출",
  },
};
