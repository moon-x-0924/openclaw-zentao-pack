import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, getNestedValue, renderListSection, section } from "./_helpers";

export const queryProductModulesTemplate: ReplyTemplate = {
  name: "query-product-modules",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("产品模块", `产品：${asText(getNestedValue(context.result, "product"))}`),
      section("模块数量", asText(getNestedValue(context.result, "count"), "0")),
      ...renderListSection("模块列表", items, (item, index) => `${index + 1}. ${asText(getNestedValue(item, "name"))}`, "当前没有查到模块。"),
    ].join("\n");
  },
};
