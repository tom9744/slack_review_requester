import {
  InputBlock,
  ModalView,
  MultiSelect,
  MultiUsersSelect,
  PlainTextInput,
  Select,
  StaticSelect,
} from "@slack/bolt";

type ModalInput = Select | MultiSelect | PlainTextInput;

enum ModalContent {
  ReviewerList = "reviewer_list",
  WorkSummary = "work_summary",
  MergeRequestURL = "merge_request_url",
  DueTime = "due_time",
  EstimatedTime = "estimated_time",
  CherryPick = "cherry_pick",
}

interface EnhancedInputBlock<T extends ModalContent, U extends ModalInput>
  extends InputBlock {
  block_id: `${T}`;
  element: U & { action_id: `${T}_action` };
}

interface EnhancedModalView extends ModalView {
  blocks: Array<
    | EnhancedInputBlock<ModalContent.ReviewerList, MultiUsersSelect>
    | EnhancedInputBlock<ModalContent.WorkSummary, PlainTextInput>
    | EnhancedInputBlock<ModalContent.MergeRequestURL, PlainTextInput>
    | EnhancedInputBlock<ModalContent.DueTime, StaticSelect>
    | EnhancedInputBlock<ModalContent.EstimatedTime, PlainTextInput>
    | EnhancedInputBlock<ModalContent.CherryPick, PlainTextInput>
  >;
}

const REVIEWER_LIST: EnhancedInputBlock<
  ModalContent.ReviewerList,
  MultiUsersSelect
> = {
  type: "input",
  block_id: "reviewer_list",
  element: {
    type: "multi_users_select",
    action_id: "reviewer_list_action",
    placeholder: { type: "plain_text", text: "리뷰어를 선택하세요." },
  },
  label: { type: "plain_text", text: "누구에게 리뷰를 요청할까요?" },
};

const WORK_SUMMARY: EnhancedInputBlock<
  ModalContent.WorkSummary,
  PlainTextInput
> = {
  type: "input",
  block_id: "work_summary",
  element: {
    type: "plain_text_input",
    action_id: "work_summary_action",
    multiline: true,
  },
  label: { type: "plain_text", text: "작업 내용을 요약해주세요." },
};

const MERGE_REQUEST_URL: EnhancedInputBlock<
  ModalContent.MergeRequestURL,
  PlainTextInput
> = {
  type: "input",
  block_id: "merge_request_url",
  element: {
    type: "plain_text_input",
    action_id: "merge_request_url_action",
  },
  label: { type: "plain_text", text: "MR URL을 입력해주세요." },
};

const DUE_TIME: EnhancedInputBlock<ModalContent.DueTime, StaticSelect> = {
  type: "input",
  block_id: "due_time",
  element: {
    type: "static_select",
    action_id: "due_time_action",
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

const ESTIMATED_TIME: EnhancedInputBlock<
  ModalContent.EstimatedTime,
  PlainTextInput
> = {
  type: "input",
  block_id: "estimated_time",
  element: {
    type: "plain_text_input",
    action_id: "estimated_time_action",
  },
  label: { type: "plain_text", text: "예상되는 소요 시간은 어느 정도인가요?" },
  optional: true,
};

const CHERRY_PICK: EnhancedInputBlock<ModalContent.CherryPick, PlainTextInput> =
  {
    type: "input",
    block_id: "cherry_pick",
    element: {
      type: "plain_text_input",
      action_id: "cherry_pick_action",
    },
    label: { type: "plain_text", text: "체리픽이 필요한가요?" },
    optional: true,
  };

export const REVIEW_REQUEST_MODAL: EnhancedModalView = {
  type: "modal",
  callback_id: "new_review_request",
  title: { type: "plain_text", text: "새로운 리뷰 요청" },
  blocks: [
    REVIEWER_LIST,
    WORK_SUMMARY,
    MERGE_REQUEST_URL,
    DUE_TIME,
    ESTIMATED_TIME,
    CHERRY_PICK,
  ],
  submit: {
    type: "plain_text",
    text: "제출",
  },
};
