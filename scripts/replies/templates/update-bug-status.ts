import { createActionTemplate } from "./_helpers";

export const updateBugStatusTemplate = createActionTemplate("update-bug-status", () => "【Bug 状态更新】成功", [
  { label: "Bug", formatter: (context) => String(context.result.bug ?? "-") },
  { label: "状态变更", formatter: (context) => `-> ${context.result.status ?? "-"}` },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
