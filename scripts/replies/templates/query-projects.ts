import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatProjectLine(item: JsonObject, index: number): string {
  return `${index + 1}. 项目#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "name"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "周期", path: "begin" },
    { label: "结束", path: "end" },
    { label: "PM", path: "PM" },
  ])}`;
}

export const queryProjectsTemplate: ReplyTemplate = {
  name: "query-projects",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("项目列表", `共 ${asText(getNestedValue(context.result, "count"), "0")} 个`),
      ...renderListSection("明细", items, formatProjectLine, "当前没有查到项目。"),
    ].join("\n");
  },
};
