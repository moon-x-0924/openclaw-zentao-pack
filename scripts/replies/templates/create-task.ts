import { createActionTemplate } from "./_helpers";

export const createTaskTemplate = createActionTemplate("create-task", () => "【创建任务结果】成功", [
  { label: "任务", formatter: (context) => `${context.result.name ?? "-"}（ID：${context.result.task_id ?? "-"}）` },
  { label: "归属", formatter: (context) => `执行：${context.result.execution ?? "-"}；负责人：${context.result.assigned_to ?? "-"}` },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
