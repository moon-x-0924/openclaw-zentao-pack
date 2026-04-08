import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatTestcaseLine(item: JsonObject, index: number): string {
  return `${index + 1}. 用例#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "title"))} | ${formatLineFields(item, [
    { label: "类型", path: "type" },
    { label: "阶段", path: "stage" },
    { label: "状态", path: "status" },
  ])}`;
}

export const queryTestcasesTemplate: ReplyTemplate = {
  name: "query-testcases",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("测试用例列表", `产品：${asText(getNestedValue(context.result, "product"))}`),
      section("数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatTestcaseLine, "当前没有查到测试用例。"),
    ].join("\n");
  },
};
