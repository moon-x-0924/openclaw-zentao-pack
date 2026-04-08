import { createActionTemplate } from "./_helpers";

export const linkTesttaskCasesTemplate = createActionTemplate("link-testtask-cases", () => "【测试单关联用例结果】成功", [
  { label: "测试单", formatter: (context) => String(context.result.testtask ?? "-") },
  { label: "关联数量", formatter: (context) => String(context.result.count ?? "0") },
  { label: "用例", formatter: (context) => Array.isArray(context.result.cases) ? context.result.cases.join(",") || "-" : "-" },
]);
