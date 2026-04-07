import type { ReplyTemplate } from "./template_types";
import { queryMyTasksTemplate } from "./templates/query-my-tasks";
import { genericFallbackTemplate } from "./templates/generic-fallback";

const TEMPLATE_REGISTRY: Record<string, ReplyTemplate> = {
  "query-my-tasks": queryMyTasksTemplate,
};

export function resolveReplyTemplate(templateName: string | undefined): ReplyTemplate {
  if (templateName && TEMPLATE_REGISTRY[templateName]) {
    return TEMPLATE_REGISTRY[templateName];
  }
  return genericFallbackTemplate;
}
