import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getDisplayRole, getDisplayUser, getNestedValue, renderListSection, section } from "./_helpers";

function formatBugLine(item: JsonObject, index: number): string {
  const title = asText(getNestedValue(item, "title"));
  const fields = formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "严重程度", path: "severity" },
    { label: "优先级", path: "pri" },
    { label: "负责人", path: "assignedTo" },
  ]);
  return `${index + 1}. BUG#${asText(getNestedValue(item, "id"))} ${title} | ${fields}`;
}

export const queryMyBugsTemplate: ReplyTemplate = {
  name: "query-my-bugs",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    const lines = [
      section("用户", getDisplayUser(context)),
      section("禅道角色", getDisplayRole(context)),
      section(
        "Bug 统计",
        `我的 Bug：${asText(getNestedValue(context.result, "count"), "0")}；待处理事项：${asText(getNestedValue(context.result, "todo_count"), "0")}`,
      ),
      ...renderListSection("Bug 列表", items, formatBugLine, "当前没有查到你的 Bug。"),
      section("建议", "如需查看详情，可继续发送：Bug详情 {id}"),
    ];
    return lines.join("\n");
  },
};
