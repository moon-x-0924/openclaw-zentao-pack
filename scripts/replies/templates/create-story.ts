import { createActionTemplate } from "./_helpers";

export const createStoryTemplate = createActionTemplate("create-story", () => "【创建需求结果】成功", [
  { label: "需求", formatter: (context) => `${context.result.title ?? "-"}（ID：${context.result.story_id ?? "-"}）` },
  { label: "归属", formatter: (context) => `产品：${context.result.product ?? "-"}；评审人：${context.result.reviewer ?? "-"}` },
  { label: "摘要", formatter: (context) => String(context.result.spec ?? "-") },
]);
