import { asText, createDetailTemplate, getNestedValue } from "./_helpers";

export const queryProductOverviewTemplate = createDetailTemplate(
  "query-product-overview",
  (context) => `【产品概览】${asText(getNestedValue(context.result, "overview.name"), `PRODUCT#${String(context.result.product ?? "-")}`)}`,
  [
    {
      label: "基本信息",
      path: "overview",
      fields: [
        { label: "ID", path: "id" },
        { label: "状态", path: "status" },
        { label: "PO", path: "PO" },
        { label: "QD", path: "QD" },
        { label: "RD", path: "RD" },
      ],
    },
    {
      label: "需求概览",
      path: "overview",
      fields: [
        { label: "总需求", path: "totalStories" },
        { label: "激活中", path: "activeStories" },
        { label: "评审中", path: "reviewingStories" },
      ],
    },
    {
      label: "缺陷与发布",
      path: "overview",
      fields: [
        { label: "Bug总数", path: "totalBugs" },
        { label: "未解决Bug", path: "unresolvedBugs" },
        { label: "发布数", path: "releases" },
      ],
    },
  ],
);
