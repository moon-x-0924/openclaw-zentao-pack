import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getDisplayRole, getDisplayUser, getNestedValue, renderListSection, section } from "./_helpers";

function formatStoryLine(item: JsonObject, index: number): string {
  return `${index + 1}. 需求#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "title"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "阶段", path: "stage" },
    { label: "优先级", path: "pri" },
    { label: "指派给", path: "assignedTo" },
  ])}`;
}

export const queryMyStoriesTemplate: ReplyTemplate = {
  name: "query-my-stories",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("用户", getDisplayUser(context)),
      section("禅道角色", getDisplayRole(context)),
      section("我的需求", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatStoryLine, "当前没有查到你负责的需求。"),
    ].join("\n");
  },
};
