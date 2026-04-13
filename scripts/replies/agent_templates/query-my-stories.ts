import type { ReplyTemplate } from "../template_types";
import { WECOM_INTERACTIVE_ACTIONS, buildInteractiveActionKey } from "../../callbacks/wecom_interactive_registry";
import { createAgentListTemplate, formatFieldSummary, getPathValue, getText } from "./_helpers";

function renderStoryLine(item: Record<string, unknown>, index: number): string {
  const suffix = formatFieldSummary(item, [
    { label: "状态", path: "status" },
    { label: "优先级", path: "pri" },
    { label: "负责人", path: "assignedTo", hideIfMissing: true },
  ]);
  return `${index + 1}. #${getText(getPathValue(item, "id"), String(index + 1))} ${getText(getPathValue(item, "title"), "-")}${suffix && suffix !== "-" ? ` | ${suffix}` : ""}`;
}

export const queryMyStoriesAgentTemplate: ReplyTemplate = createAgentListTemplate({
  name: "query-my-stories",
  cardType: "button_interaction",
  title: () => "我的需求",
  itemsPath: "items",
  countPath: "count",
  emptyText: "当前没有查到你负责的需求。",
  actions: (c) => {
    const firstStoryId = getText(getPathValue(c.result, "items.0.id"), "");
    return firstStoryId
      ? [{
          label: "查看首条需求",
          key: buildInteractiveActionKey(WECOM_INTERACTIVE_ACTIONS.storyOpenDetail, { story: firstStoryId }),
          style: 1 as const,
        }]
      : [];
  },
  metrics: (c) => [
    { keyname: "总数", value: getText(getPathValue(c.result, "count"), "0") },
    { keyname: "待办", value: getText(getPathValue(c.result, "todo_count"), "0") },
  ],
  quoteText: () => "继续发送“需求详情 ID”可查看单条详情。",
  itemRenderer: renderStoryLine,
});
