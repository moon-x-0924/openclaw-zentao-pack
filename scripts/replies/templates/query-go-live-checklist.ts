import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, getNestedValue, section } from "./_helpers";

export const queryGoLiveChecklistTemplate: ReplyTemplate = {
  name: "query-go-live-checklist",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "checklist"));
    return [
      section("上线检查结论", `通过 ${asText(getNestedValue(context.result, "passed_count"), "0")}/${asText(getNestedValue(context.result, "total_count"), "0")}`),
      section("检查项", ""),
      ...(items.length === 0
        ? ["1. 暂无检查项"]
        : items.map((item, index) => `${index + 1}. ${asText(getNestedValue(item, "item"))}：${item.passed ? "通过" : "未通过"} - ${asText(getNestedValue(item, "actual"))}`)),
      section("建议", "未通过项需要先处理完成后再上线。"),
    ].join("\n");
  },
};
