import { createActionTemplate } from "./_helpers";

export const createTesttaskTemplate = createActionTemplate("create-testtask", () => "【创建测试单结果】成功", [
  { label: "测试单", formatter: (context) => `${context.result.name ?? "-"}（ID：${context.result.testtask_id ?? "-"}）` },
  { label: "归属", formatter: (context) => `产品：${context.result.product ?? "-"}；版本：${Array.isArray(context.result.builds) ? context.result.builds.join(",") : "-"}` },
  { label: "周期", formatter: (context) => `${context.result.begin ?? "-"} ~ ${context.result.end ?? "-"}` },
]);
