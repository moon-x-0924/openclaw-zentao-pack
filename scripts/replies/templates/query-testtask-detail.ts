import { asText, createDetailTemplate, getNestedValue } from "./_helpers";

export const queryTesttaskDetailTemplate = createDetailTemplate("query-testtask-detail", (context) => `【测试单详情】TESTTASK#${String(context.result.testtask ?? "-")} ${asText(getNestedValue(context.result, "detail.name"), "")}`.trim(), [
  { label: "基本信息", path: "detail", fields: [{ label: "状态", path: "status" }, { label: "负责人", path: "owner" }, { label: "优先级", path: "pri" }, { label: "类型", path: "type" }] },
  { label: "归属信息", path: "detail", fields: [{ label: "产品", path: "product" }, { label: "项目", path: "project" }, { label: "执行", path: "execution" }, { label: "版本", path: "buildName" }] },
  { label: "时间信息", path: "detail", fields: [{ label: "计划开始", path: "begin" }, { label: "计划结束", path: "end" }, { label: "实际开始", path: "realBegan" }, { label: "实际完成", path: "realFinishedDate" }] },
  { label: "说明", formatter: (context) => asText(getNestedValue(context.result, "detail.desc")) },
]);
