import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatReleaseLine(item: JsonObject, index: number): string {
  return `${index + 1}. 发布#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "name"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "日期", path: "date" },
    { label: "创建人", path: "createdBy" },
  ])}`;
}

export const queryReleasesTemplate: ReplyTemplate = {
  name: "query-releases",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("发布列表", `产品：${asText(getNestedValue(context.result, "product"))}`),
      section("数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatReleaseLine, "当前没有查到发布。"),
    ].join("\n");
  },
};
