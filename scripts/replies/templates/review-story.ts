import { createActionTemplate } from "./_helpers";

export const reviewStoryTemplate = createActionTemplate("review-story", () => "【需求评审结果】成功", [
  { label: "需求", formatter: (context) => String(context.result.story ?? "-") },
  { label: "评审结论", formatter: (context) => String(context.result.result ?? "-") },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
