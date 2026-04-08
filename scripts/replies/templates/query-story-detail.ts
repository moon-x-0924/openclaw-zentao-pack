import { asText, createDetailTemplate, getNestedValue } from "./_helpers";

export const queryStoryDetailTemplate = createDetailTemplate("query-story-detail", (context) => `【需求详情】${String(context.result.title ?? `STORY#${context.result.story ?? "-"}`)}`, [
  { label: "基本信息", path: "detail", fields: [{ label: "状态", path: "status" }, { label: "阶段", path: "stage" }, { label: "优先级", path: "pri" }, { label: "预估", path: "estimate" }] },
  { label: "归属信息", path: "detail", fields: [{ label: "产品", path: "product" }, { label: "模块", path: "module" }, { label: "指派给", path: "assignedTo" }] },
  { label: "提出与评审", path: "detail", fields: [{ label: "提出人", path: "openedBy" }, { label: "评审人", path: "reviewer" }] },
  { label: "需求描述", formatter: (context) => asText(getNestedValue(context.result, "detail.spec")) },
  { label: "验收标准", formatter: (context) => asText(getNestedValue(context.result, "detail.verify")) },
]);
