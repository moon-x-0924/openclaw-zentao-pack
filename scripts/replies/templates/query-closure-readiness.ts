import type { ReplyTemplate } from "../template_types";
import { asText, getNestedValue, section } from "./_helpers";

export const queryClosureReadinessTemplate: ReplyTemplate = {
  name: "query-closure-readiness",
  render(context) {
    const readiness = [
      getNestedValue(context.result, "readiness.has_release_record") === true,
      getNestedValue(context.result, "readiness.unresolved_bugs_zero") === true,
      getNestedValue(context.result, "readiness.open_tasks_zero") === true,
      getNestedValue(context.result, "readiness.active_stories_zero") === true,
      getNestedValue(context.result, "readiness.has_acceptance_basis") === true,
    ].every(Boolean)
      ? "可结项"
      : "需补齐";

    return [
      section("结项准备度", readiness),
      section("关键指标", `未解决Bug：${asText(getNestedValue(context.result, "metrics.unresolved_bugs"), "0")}；未完成任务：${asText(getNestedValue(context.result, "metrics.open_tasks"), "0")}；活跃需求：${asText(getNestedValue(context.result, "metrics.active_stories"), "0")}`),
      section("范围统计", `发布：${asText(getNestedValue(context.result, "metrics.releases"), "0")}；需求：${asText(getNestedValue(context.result, "metrics.stories"), "0")}；测试用例：${asText(getNestedValue(context.result, "metrics.test_cases"), "0")}`),
      section("建议", "若仍存在未完成项，建议先查询：关闭阻塞项"),
    ].join("\n");
  },
};
