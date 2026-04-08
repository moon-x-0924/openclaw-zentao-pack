import type { ReplyTemplate } from "../template_types";
import { asText, getNestedValue, section } from "./_helpers";

export const queryAcceptanceOverviewTemplate: ReplyTemplate = {
  name: "query-acceptance-overview",
  render(context) {
    return [
      section("验收概览", asText(getNestedValue(context.result, "product_name"))),
      section("产品状态", asText(getNestedValue(context.result, "product_status"))),
      section("总体计数", `发布：${asText(getNestedValue(context.result, "counts.releases"), "0")}；需求：${asText(getNestedValue(context.result, "counts.stories"), "0")}；任务：${asText(getNestedValue(context.result, "counts.tasks"), "0")}；用例：${asText(getNestedValue(context.result, "counts.test_cases"), "0")}；产品Bug：${asText(getNestedValue(context.result, "counts.product_bugs"), "0")}`),
      section("任务状态分布", asText(getNestedValue(context.result, "task_status"))),
      section("需求状态分布", asText(getNestedValue(context.result, "story_status"))),
      section("Bug 状态分布", asText(getNestedValue(context.result, "bug_status"))),
      section("我的任务摘要", asText(getNestedValue(context.result, "my_tasks_summary"))),
    ].join("\n");
  },
};
