import { createActionTemplate } from "./_helpers";

export const createProductModulesTemplate = createActionTemplate("create-product-modules", () => "【创建模块结果】成功", [
  { label: "产品", formatter: (context) => String(context.result.product ?? "-") },
  { label: "模块列表", formatter: (context) => Array.isArray(context.result.modules) ? context.result.modules.join("、") || "-" : "-" },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
