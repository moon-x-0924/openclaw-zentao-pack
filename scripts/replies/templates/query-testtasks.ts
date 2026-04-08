import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatTesttaskLine(item: JsonObject, index: number): string {
  return `${index + 1}. 测试单#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "name"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "负责人", path: "owner" },
    { label: "周期", path: "begin" },
    { label: "结束", path: "end" },
  ])}`;
}

export const queryTesttasksTemplate: ReplyTemplate = {
  name: "query-testtasks",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    const scope = `产品：${asText(getNestedValue(context.result, "product"))}；项目：${asText(getNestedValue(context.result, "project"))}；执行：${asText(getNestedValue(context.result, "execution"))}`;
    return [
      section("测试单列表", ""),
      section("筛选上下文", scope),
      section("数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatTesttaskLine, "当前没有查到测试单。"),
    ].join("\n");
  },
};
