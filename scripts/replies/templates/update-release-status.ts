import { createActionTemplate } from "./_helpers";

export const updateReleaseStatusTemplate = createActionTemplate("update-release-status", () => "【发布状态更新】成功", [
  { label: "发布", formatter: (context) => String(context.result.release ?? "-") },
  { label: "状态变更", formatter: (context) => `-> ${context.result.status ?? "-"}` },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
