import { createActionTemplate } from "./_helpers";

export const createTestcaseTemplate = createActionTemplate("create-testcase", () => "【创建测试用例结果】成功", [
  { label: "用例", formatter: (context) => `${context.result.title ?? "-"}（ID：${context.result.case_id ?? "-"}）` },
  { label: "归属", formatter: (context) => `产品：${context.result.product ?? "-"}` },
  { label: "预期", formatter: (context) => Array.isArray(context.result.expects) ? context.result.expects.join("；") || "-" : "-" },
]);
