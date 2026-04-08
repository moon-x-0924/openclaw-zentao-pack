import { createActionTemplate } from "./_helpers";

export const linkReleaseItemsTemplate = createActionTemplate("link-release-items", () => "【关联发布项结果】成功", [
  { label: "发布", formatter: (context) => String(context.result.release ?? "-") },
  { label: "关联内容", formatter: (context) => `需求/Bug 数量：${context.result.count ?? 0}` },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
