import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatStoryLine(item: JsonObject, index: number): string {
  return `${index + 1}. 需求#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "title"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "阶段", path: "stage" },
    { label: "模块", path: "module" },
  ])}`;
}

export const queryExecutionStoriesTemplate: ReplyTemplate = {
  name: "query-execution-stories",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("迭代需求", `执行：${asText(getNestedValue(context.result, "execution"))}`),
      section("数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatStoryLine, "当前没有查到迭代需求。"),
    ].join("\n");
  },
};
