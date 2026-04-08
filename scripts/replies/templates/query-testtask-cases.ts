import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatTesttaskCaseLine(item: JsonObject, index: number): string {
  return `${index + 1}. 记录#${asText(getNestedValue(item, "id"))} | 用例#${asText(getNestedValue(item, "case"))} ${asText(getNestedValue(item, "title"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "最近结果", path: "lastRunResult" },
    { label: "执行人", path: "lastRunner" },
  ])}`;
}

export const queryTesttaskCasesTemplate: ReplyTemplate = {
  name: "query-testtask-cases",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("测试单用例", `测试单：${asText(getNestedValue(context.result, "testtask"))}`),
      section("数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatTesttaskCaseLine, "当前没有查到测试单用例。"),
    ].join("\n");
  },
};
