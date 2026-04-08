import { createActionTemplate } from "./_helpers";

export const assignBugTemplate = createActionTemplate("assign-bug", () => "【Bug 指派结果】成功", [
  { label: "Bug", formatter: (context) => String(context.result.bug ?? "-") },
  { label: "指派给", formatter: (context) => String(context.result.assigned_to ?? "-") },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
