import { asText, createDetailTemplate, getNestedValue } from "./_helpers";

export const queryBugDetailTemplate = createDetailTemplate("query-bug-detail", (context) => `【Bug 详情】BUG#${String(context.result.bug ?? "-")} ${asText(getNestedValue(context.result, "detail.title"), "")}`.trim(), [
  { label: "基本信息", path: "detail", fields: [{ label: "状态", path: "status" }, { label: "解决方案", path: "resolution" }, { label: "严重程度", path: "severity" }, { label: "优先级", path: "pri" }] },
  { label: "归属信息", path: "detail", fields: [{ label: "产品", path: "product" }, { label: "项目", path: "project" }, { label: "执行", path: "execution" }, { label: "测试单", path: "testtask" }] },
  { label: "处理信息", path: "detail", fields: [{ label: "负责人", path: "assignedTo" }, { label: "提交人", path: "openedBy" }, { label: "解决人", path: "resolvedBy" }, { label: "关闭人", path: "closedBy" }] },
  { label: "复现/描述", formatter: (context) => asText(getNestedValue(context.result, "detail.steps")) },
]);
