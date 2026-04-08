import { createActionTemplate } from "./_helpers";

export const createReleaseTemplate = createActionTemplate("create-release", () => "【创建发布结果】成功", [
  { label: "发布", formatter: (context) => `${context.result.name ?? "-"}（ID：${context.result.release_id ?? "-"}）` },
  { label: "归属", formatter: (context) => `产品：${context.result.product ?? "-"}` },
  { label: "发布日期", formatter: (context) => String(context.result.date ?? "-") },
]);
