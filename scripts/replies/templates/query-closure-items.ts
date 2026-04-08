import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, getNestedValue, section } from "./_helpers";

function numbered(title: string, items: string[]): string[] {
  return [section(title, ""), ...(items.length === 0 ? ["1. 无"] : items.map((item, index) => `${index + 1}. ${item}`))];
}

function summarizeItems(value: unknown, labelPath: string): string[] {
  return asObjectArray(value).map((item) => asText(getNestedValue(item, labelPath)));
}

export const queryClosureItemsTemplate: ReplyTemplate = {
  name: "query-closure-items",
  render(context) {
    return [
      section("结项阻塞概览", `未完成任务：${asText(getNestedValue(context.result, "blockers.open_tasks"), "0")}`),
      `活跃需求：${asText(getNestedValue(context.result, "blockers.active_stories"), "0")}`,
      `未解决Bug：${asText(getNestedValue(context.result, "blockers.unresolved_bugs"), "0")}`,
      `异常发布：${asText(getNestedValue(context.result, "blockers.non_normal_releases"), "0")}`,
      ...numbered("未完成任务", summarizeItems(getNestedValue(context.result, "items.open_tasks"), "name")),
      ...numbered("活跃需求", summarizeItems(getNestedValue(context.result, "items.active_stories"), "title")),
      ...numbered("未解决Bug", summarizeItems(getNestedValue(context.result, "items.unresolved_bugs"), "title")),
      ...numbered("异常发布", summarizeItems(getNestedValue(context.result, "items.non_normal_releases"), "name")),
    ].join("\n");
  },
};
