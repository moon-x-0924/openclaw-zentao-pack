import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatTaskLine(item: JsonObject, index: number): string {
  return `${index + 1}. 任务#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "name"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "负责人", path: "assignedTo" },
    { label: "进度", path: "progress" },
    { label: "剩余", path: "left" },
  ])}`;
}

export const queryExecutionTasksTemplate: ReplyTemplate = {
  name: "query-execution-tasks",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("迭代任务", `执行：${asText(getNestedValue(context.result, "execution"))}`),
      section("数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("明细", items, formatTaskLine, "当前没有查到任务。"),
    ].join("\n");
  },
};
