import { createDetailTemplate, getNestedValue } from "./_helpers";

export const queryReleaseDetailTemplate = createDetailTemplate("query-release-detail", (context) => `【发布详情】${String(context.result.title ?? `RELEASE#${context.result.release ?? "-"}`)}`, [
  { label: "基本信息", path: "detail", fields: [{ label: "状态", path: "status" }, { label: "发布日期", path: "date" }, { label: "发布标记", path: "marker" }] },
  { label: "归属信息", path: "detail", fields: [{ label: "产品", path: "product" }, { label: "版本", path: "build" }] },
  {
    label: "内容摘要",
    formatter: (context) =>
      `需求数：${String(getNestedValue(context.result, "detail.stories.length") ?? 0)}；Bug数：${String(getNestedValue(context.result, "detail.bugs.length") ?? 0)}；遗留Bug数：${String(getNestedValue(context.result, "detail.leftBugs.length") ?? 0)}`,
  },
  { label: "发布说明", formatter: (context) => String(getNestedValue(context.result, "detail.desc") ?? "-") },
  { label: "摘要", formatter: (context) => String(getNestedValue(context.result, "detail.summary") ?? "-") },
]);
