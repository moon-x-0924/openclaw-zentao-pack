import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatExecutionLine(item: JsonObject, index: number): string {
  return `${index + 1}. 迭代#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "name"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "周期", path: "begin" },
    { label: "结束", path: "end" },
    { label: "PM", path: "PM" },
  ])}`;
}

export const queryExecutionsTemplate: ReplyTemplate = {
  name: "query-executions",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("迭代列表", `项目：${asText(getNestedValue(context.result, "project"))}`),
      section("数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatExecutionLine, "当前没有查到迭代。"),
    ].join("\n");
  },
};
