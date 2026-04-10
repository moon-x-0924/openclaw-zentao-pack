import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyRenderContext, ReplyTemplate } from "../template_types";
import { buildTextNoticeCard } from "./_helpers";

function getNestedValue(record: JsonObject | undefined, path: string): string | undefined {
  if (!record) return undefined;

  const parts = path.split(".");
  let current: unknown = record;
  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as JsonObject)[part];
  }

  if (current === undefined || current === null) {
    return undefined;
  }

  const text = String(current).trim();
  return text || undefined;
}

export const queryMyTasksAgentTemplate: ReplyTemplate = {
  name: "agent-query-my-tasks",
  render(context: ReplyRenderContext) {
    const result = context.result;
    const tasks = Array.isArray(result.tasks)
      ? result.tasks.filter(
          (item: unknown): item is JsonObject =>
            typeof item === "object" && item !== null && !Array.isArray(item),
        )
      : [];

    const displayUser =
      getNestedValue(result, "wecom_user.name") ??
      getNestedValue(result, "userid") ??
      context.userid ??
      "未知用户";

    const displayZentaoRole =
      getNestedValue(result, "matched_user.role") ??
      getNestedValue(result, "matched_user.account") ??
      getNestedValue(result, "matched_user.realname") ??
      "未匹配";

    const statusCounts =
      result.status_counts && typeof result.status_counts === "object" && !Array.isArray(result.status_counts)
        ? Object.entries(result.status_counts as Record<string, unknown>).map(([key, value]) => ({
            keyname: key,
            value: String(value),
          }))
        : [];

    const taskLines = tasks.slice(0, 3).map((task: JsonObject, index: number) => {
      const name = getNestedValue(task, "name") ?? `任务${index + 1}`;
      const status = getNestedValue(task, "status") ?? "unknown";
      const deadline = getNestedValue(task, "deadline");
      return `${index + 1}. ${name} [${status}]${deadline ? ` 截止:${deadline}` : ""}`;
    });

    const card = buildTextNoticeCard({
      title: `${displayUser}的任务`,
      desc: `禅道角色：${displayZentaoRole}`,
      body:
        taskLines.length > 0
          ? taskLines.join("\n")
          : "当前没有查询到你的任务或待办。",
      taskId: `query-my-tasks-${context.userid}`,
      horizontalContentList: [
        { keyname: "用户", value: displayUser },
        { keyname: "角色", value: displayZentaoRole },
        ...statusCounts.slice(0, 2),
      ],
      quoteText: taskLines.length > 0 ? "继续发送“任务详情 任务ID”查看单条详情。" : "可改查我的 Bug 或项目进展。",
    });

    return JSON.stringify({ template_card: card });
  },
};
