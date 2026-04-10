import type { ReplyTemplate } from "../template_types";
import { wrapTextAsAgentTemplateCard } from "./_helpers";

export const genericAgentFallbackTemplate: ReplyTemplate = {
  name: "agent-generic-fallback",
  render(context) {
    return wrapTextAsAgentTemplateCard(
      context,
      `已执行禅道脚本：${context.script}，但当前未配置自建应用专属回复模板。`,
      "generic-fallback",
    );
  },
};
