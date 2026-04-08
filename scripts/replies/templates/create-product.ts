import { createActionTemplate } from "./_helpers";

export const createProductTemplate = createActionTemplate("create-product", () => "【创建产品结果】成功", [
  { label: "产品信息", formatter: (context) => `名称：${context.result.name ?? "-"}；ID：${context.result.product_id ?? "-"}` },
  { label: "关键参数", formatter: (context) => `类型：${context.result.type ?? "-"}；项目集：${context.result.program ?? "-"}；访问控制：${context.result.acl ?? "-"}` },
  { label: "回执", formatter: (context) => String(context.result.message ?? "-") },
]);
