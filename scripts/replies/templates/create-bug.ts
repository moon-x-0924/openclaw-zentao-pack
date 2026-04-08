import { createActionTemplate } from "./_helpers";

export const createBugTemplate = createActionTemplate("create-bug", () => "【创建Bug结果】成功", [
  { label: "Bug", formatter: (context) => `${context.result.title ?? "-"}（ID：${context.result.bug_id ?? "-"}）` },
  { label: "归属", formatter: (context) => `产品：${context.result.product ?? "-"}；版本：${Array.isArray(context.result.builds) ? context.result.builds.join(",") : "-"}` },
  { label: "说明", formatter: (context) => String(context.result.steps ?? "-") },
]);
