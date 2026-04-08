import { createActionTemplate } from "./_helpers";

export const runTesttaskCaseTemplate = createActionTemplate("run-testtask-case", () => "【用例执行结果】成功", [
  { label: "执行记录", formatter: (context) => String(context.result.run ?? "-") },
  { label: "结果", formatter: (context) => String(context.result.result ?? "-") },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
