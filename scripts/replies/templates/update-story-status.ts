import { createActionTemplate } from "./_helpers";

export const updateStoryStatusTemplate = createActionTemplate("update-story-status", () => "【需求状态更新】成功", [
  { label: "需求", formatter: (context) => String(context.result.story ?? "-") },
  { label: "状态变更", formatter: (context) => `-> ${context.result.status ?? "-"}` },
  { label: "说明", formatter: (context) => String(context.result.message ?? "-") },
]);
