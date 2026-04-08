import { asText, createDetailTemplate, getNestedValue } from "./_helpers";

export const queryTaskDetailTemplate = createDetailTemplate("query-task-detail", (context) => `【任务详情】TASK#${String(context.result.task ?? "-")} ${asText(getNestedValue(context.result, "detail.name"), "")}`.trim(), [
  { label: "基本信息", path: "detail", fields: [{ label: "状态", path: "status" }, { label: "负责人", path: "assignedTo" }, { label: "优先级", path: "pri" }] },
  { label: "工时信息", path: "detail", fields: [{ label: "预估", path: "estimate" }, { label: "已消耗", path: "consumed" }, { label: "剩余", path: "left" }] },
  { label: "归属信息", path: "detail", fields: [{ label: "项目", path: "project" }, { label: "执行", path: "execution" }, { label: "关联需求", path: "story" }] },
]);
