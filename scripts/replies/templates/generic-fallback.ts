import type { ReplyTemplate } from "../template_types";

export const genericFallbackTemplate: ReplyTemplate = {
  name: "generic-fallback",
  render(context) {
    return `已执行禅道脚本：${context.script}，但当前未配置专属回复模板。`;
  },
};
