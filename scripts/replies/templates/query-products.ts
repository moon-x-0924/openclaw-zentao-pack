import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatProductLine(item: JsonObject, index: number): string {
  return `${index + 1}. 产品#${asText(getNestedValue(item, "id"))} ${asText(getNestedValue(item, "name"))} | ${formatLineFields(item, [
    { label: "状态", path: "status" },
    { label: "类型", path: "type" },
    { label: "PO", path: "PO" },
    { label: "QD", path: "QD" },
    { label: "RD", path: "RD" },
  ])}`;
}

export const queryProductsTemplate: ReplyTemplate = {
  name: "query-products",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("产品列表", `共 ${asText(getNestedValue(context.result, "count"), "0")} 个`),
      ...renderListSection("明细", items, formatProductLine, "当前没有查到产品。"),
    ].join("\n");
  },
};
