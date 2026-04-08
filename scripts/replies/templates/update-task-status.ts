import { createActionTemplate } from "./_helpers";

export const updateTaskStatusTemplate = createActionTemplate("update-task-status", () => "【任务状态更新】成功", [
  { label: "任务", formatter: (context) => String(context.result.task ?? "-") },
  { label: "状态变更", formatter: (context) => `-> ${context.result.status ?? "-"}` },
  { label: "备注", formatter: (context) => String(context.result.comment ?? context.result.message ?? "-") },
]);
