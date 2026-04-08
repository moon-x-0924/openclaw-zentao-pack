import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyTemplate } from "../template_types";
import { asObjectArray, asText, formatLineFields, getNestedValue, renderListSection, section } from "./_helpers";

function formatTeamMember(item: JsonObject, index: number): string {
  const name = asText(getNestedValue(item, "realname"));
  const account = asText(getNestedValue(item, "account"));
  return `${index + 1}. ${name}(${account}) | ${formatLineFields(item, [
    { label: "角色", path: "role" },
    { label: "可用天数", path: "days" },
    { label: "工时", path: "hours" },
  ])}`;
}

export const queryExecutionTeamTemplate: ReplyTemplate = {
  name: "query-execution-team",
  render(context) {
    const items = asObjectArray(getNestedValue(context.result, "items"));
    return [
      section("团队成员", `共 ${asText(getNestedValue(context.result, "count"), "0")} 人`),
      ...renderListSection("成员列表", items, formatTeamMember, "当前没有查到执行成员。"),
    ].join("\n");
  },
};
