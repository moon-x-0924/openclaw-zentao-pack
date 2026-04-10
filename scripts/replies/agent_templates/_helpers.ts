import { readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyRenderContext, ReplyTemplate } from "../template_types";

interface TextNoticeCardAction extends JsonObject {
  type: number;
  url?: string;
  appid?: string;
  pagepath?: string;
}

interface TextNoticeMainTitle extends JsonObject {
  title: string;
  desc?: string;
}

interface TextNoticeHorizontalContent extends JsonObject {
  keyname: string;
  value?: string;
  url?: string;
  media_id?: string;
  userid?: string;
}

export interface TextNoticeTemplateCard extends JsonObject {
  card_type: "text_notice";
  source?: {
    desc?: string;
    desc_color?: number;
  };
  main_title: TextNoticeMainTitle;
  sub_title_text?: string;
  horizontal_content_list?: TextNoticeHorizontalContent[];
  quote_area?: {
    type: number;
    url?: string;
    appid?: string;
    pagepath?: string;
    title?: string;
    quote_text?: string;
  };
  card_action: TextNoticeCardAction;
  task_id?: string;
}

function truncateText(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, Math.max(0, maxLength - 1))}...`;
}

function normalizeLine(line: string): string {
  return line
    .replace(/^[\s\u3010\[]+/, "")
    .replace(/[\u3011\]]+$/g, "")
    .trim();
}

function inferTitle(content: string, fallbackTitle: string): string {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .find(Boolean);

  return truncateText(firstLine || fallbackTitle, 36);
}

function humanizeTemplateName(templateName: string): string {
  return templateName
    .replace(/^agent-/, "")
    .split("-")
    .filter(Boolean)
    .join(" ");
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

function ensureCardAction(action: unknown, label: string): void {
  if (!action || typeof action !== "object" || Array.isArray(action)) {
    throw new Error(`${label}.card_action must be an object`);
  }

  const type = (action as JsonObject).type;
  if (typeof type !== "number" || !Number.isInteger(type)) {
    throw new Error(`${label}.card_action.type must be an integer`);
  }

  if (type === 1) {
    if (!asNonEmptyString((action as JsonObject).url)) {
      throw new Error(`${label}.card_action.url is required when type=1`);
    }
    return;
  }

  if (type === 2) {
    if (!asNonEmptyString((action as JsonObject).appid) || !asNonEmptyString((action as JsonObject).pagepath)) {
      throw new Error(`${label}.card_action.appid and pagepath are required when type=2`);
    }
    return;
  }

  throw new Error(`${label}.card_action.type ${type} is not supported by current validator`);
}

function ensureHorizontalContentList(list: unknown, label: string): void {
  if (list === undefined) {
    return;
  }

  if (!Array.isArray(list)) {
    throw new Error(`${label}.horizontal_content_list must be an array`);
  }

  list.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`${label}.horizontal_content_list[${index}] must be an object`);
    }

    if (!asNonEmptyString((item as JsonObject).keyname)) {
      throw new Error(`${label}.horizontal_content_list[${index}].keyname is required`);
    }
  });
}

export function buildTextNoticeCard(input: {
  title: string;
  desc?: string;
  body: string;
  sourceDesc?: string;
  actionUrl?: string;
  taskId?: string;
  horizontalContentList?: TextNoticeHorizontalContent[];
  quoteText?: string;
}): TextNoticeTemplateCard {
  const title = asNonEmptyString(input.title);
  if (!title) {
    throw new Error("text_notice.main_title.title is required");
  }

  const body = asNonEmptyString(input.body);
  if (!body) {
    throw new Error("text_notice.sub_title_text is required");
  }

  return {
    card_type: "text_notice",
    source: {
      desc: input.sourceDesc ?? "企微自建应用",
      desc_color: 0,
    },
    main_title: {
      title,
      desc: input.desc,
    },
    sub_title_text: truncateText(body, 1200),
    horizontal_content_list: input.horizontalContentList,
    quote_area: input.quoteText
      ? {
          type: 0,
          quote_text: truncateText(input.quoteText, 128),
        }
      : undefined,
    card_action: {
      type: 1,
      url: input.actionUrl ?? "https://work.weixin.qq.com/",
    },
    task_id: input.taskId,
  };
}

export function validateTextNoticeCard(card: unknown, label = "template_card"): TextNoticeTemplateCard {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error(`${label} must be an object`);
  }

  const record = card as JsonObject;
  if (record.card_type !== "text_notice") {
    throw new Error(`${label}.card_type must be "text_notice"`);
  }

  const mainTitle = record.main_title;
  if (!mainTitle || typeof mainTitle !== "object" || Array.isArray(mainTitle)) {
    throw new Error(`${label}.main_title must be an object`);
  }
  if (!asNonEmptyString((mainTitle as JsonObject).title)) {
    throw new Error(`${label}.main_title.title is required`);
  }

  if (!asNonEmptyString(record.sub_title_text)) {
    throw new Error(`${label}.sub_title_text is required`);
  }

  ensureHorizontalContentList(record.horizontal_content_list, label);
  ensureCardAction(record.card_action, label);

  if (record.quote_area !== undefined) {
    const quoteArea = record.quote_area;
    if (!quoteArea || typeof quoteArea !== "object" || Array.isArray(quoteArea)) {
      throw new Error(`${label}.quote_area must be an object`);
    }
  }

  return record as TextNoticeTemplateCard;
}

export function validateAgentReplyPayload(replyText: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(replyText);
  } catch (error) {
    throw new Error(`agent reply must be valid JSON: ${(error as Error).message}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("agent reply root must be an object");
  }

  const templateCard = (parsed as JsonObject).template_card;
  if (!templateCard) {
    throw new Error("agent reply must contain template_card");
  }

  validateTextNoticeCard(templateCard, "template_card");
  return replyText;
}

export function wrapTextAsAgentTemplateCard(
  context: ReplyRenderContext,
  content: string,
  templateName: string,
): string {
  const fallbackTitle = `${humanizeTemplateName(templateName)} result`;
  const title = inferTitle(content, fallbackTitle);
  const userid = context.userid || "unknown";

  const card = buildTextNoticeCard({
    title,
    desc: `用户: ${userid}`,
    body: content.trim(),
    taskId: `${templateName}-${userid}`,
    horizontalContentList: [
      {
        keyname: "意图",
        value: truncateText(context.intent, 64),
      },
      {
        keyname: "脚本",
        value: truncateText(context.script, 64),
      },
      {
        keyname: "来源",
        value: context.sourceType,
      },
    ],
  });

  return JSON.stringify({ template_card: card });
}

export function createWrappedAgentTemplate(
  templateName: string,
  renderText: (context: ReplyRenderContext) => string,
): ReplyTemplate {
  return {
    name: `agent-${templateName}`,
    render(context: ReplyRenderContext): string {
      const content = renderText(context);
      return wrapTextAsAgentTemplateCard(context, content, templateName);
    },
  };
}

export interface AgentFieldConfig {
  label: string;
  path: string;
  fallback?: string;
  hideIfMissing?: boolean;
}

export interface AgentSectionConfig {
  label: string;
  path?: string;
  fields?: AgentFieldConfig[];
  formatter?: (context: ReplyRenderContext) => string;
}

export interface AgentListTemplateConfig {
  name: string;
  title: (context: ReplyRenderContext) => string;
  desc?: (context: ReplyRenderContext) => string | undefined;
  itemsPath: string;
  emptyText: string;
  countPath?: string;
  metrics?: (context: ReplyRenderContext) => TextNoticeHorizontalContent[];
  itemRenderer: (item: JsonObject, index: number, context: ReplyRenderContext) => string;
  maxItems?: number;
  quoteText?: (context: ReplyRenderContext) => string | undefined;
}

export interface AgentDetailTemplateConfig {
  name: string;
  title: (context: ReplyRenderContext) => string;
  desc?: (context: ReplyRenderContext) => string | undefined;
  sections: AgentSectionConfig[];
  metrics?: (context: ReplyRenderContext) => TextNoticeHorizontalContent[];
  quoteText?: (context: ReplyRenderContext) => string | undefined;
}

export interface AgentActionTemplateConfig {
  name: string;
  title: (context: ReplyRenderContext) => string;
  desc?: (context: ReplyRenderContext) => string | undefined;
  sections: AgentSectionConfig[];
  metrics?: (context: ReplyRenderContext) => TextNoticeHorizontalContent[];
  quoteText?: (context: ReplyRenderContext) => string | undefined;
}

export function getPathValue(record: unknown, path: string): unknown {
  if (!path) return record;

  const parts = path.split(".");
  let current: unknown = record;

  for (const part of parts) {
    if (Array.isArray(current)) {
      if (part === "length") {
        current = current.length;
        continue;
      }
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      current = current[index];
      continue;
    }

    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as JsonObject)[part];
  }

  return current;
}

export function getText(value: unknown, fallback = "-"): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return fallback;
    return value.map((item) => getText(item, "")).filter(Boolean).join(", ") || fallback;
  }
  if (typeof value === "object") {
    const pairs = Object.entries(value as JsonObject)
      .slice(0, 4)
      .map(([key, item]) => `${key}:${getText(item, "")}`)
      .filter((line) => !line.endsWith(":"));
    return pairs.join(" | ") || fallback;
  }
  return fallback;
}

export function getObjectArray(value: unknown): JsonObject[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is JsonObject => typeof item === "object" && item !== null && !Array.isArray(item));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value as JsonObject).filter(
      (item): item is JsonObject => typeof item === "object" && item !== null && !Array.isArray(item),
    );
  }
  return [];
}

export function formatFieldSummary(record: unknown, fields: AgentFieldConfig[], separator = " | "): string {
  const parts = fields
    .map((field) => {
      const text = getText(getPathValue(record, field.path), field.fallback ?? "-");
      if (field.hideIfMissing && text === (field.fallback ?? "-")) {
        return "";
      }
      return `${field.label}:${text}`;
    })
    .filter(Boolean);

  return parts.join(separator) || "-";
}

function renderSections(context: ReplyRenderContext, sections: AgentSectionConfig[]): string {
  return sections
    .map((section) => {
      let body = "-";
      if (section.formatter) {
        body = section.formatter(context) || "-";
      } else if (section.fields) {
        const base = section.path ? getPathValue(context.result, section.path) : context.result;
        body = formatFieldSummary(base, section.fields);
      } else if (section.path) {
        body = getText(getPathValue(context.result, section.path));
      }
      return `${section.label}\n${body}`;
    })
    .join("\n\n");
}

export function createAgentListTemplate(config: AgentListTemplateConfig): ReplyTemplate {
  return {
    name: `agent-${config.name}`,
    render(context: ReplyRenderContext): string {
      const items = getObjectArray(getPathValue(context.result, config.itemsPath));
      const body = items.length > 0
        ? items.slice(0, config.maxItems ?? 3).map((item, index) => config.itemRenderer(item, index, context)).join("\n")
        : config.emptyText;

      const card = buildTextNoticeCard({
        title: config.title(context),
        desc: config.desc?.(context),
        body,
        taskId: `${config.name}-${context.userid}`,
        horizontalContentList: config.metrics?.(context) ?? (
          config.countPath
            ? [{ keyname: "数量", value: getText(getPathValue(context.result, config.countPath), "0") }]
            : undefined
        ),
        quoteText: config.quoteText?.(context),
      });

      return JSON.stringify({ template_card: card });
    },
  };
}

export function createAgentDetailTemplate(config: AgentDetailTemplateConfig): ReplyTemplate {
  return {
    name: `agent-${config.name}`,
    render(context: ReplyRenderContext): string {
      const card = buildTextNoticeCard({
        title: config.title(context),
        desc: config.desc?.(context),
        body: renderSections(context, config.sections),
        taskId: `${config.name}-${context.userid}`,
        horizontalContentList: config.metrics?.(context),
        quoteText: config.quoteText?.(context),
      });

      return JSON.stringify({ template_card: card });
    },
  };
}

export const createAgentActionTemplate = createAgentDetailTemplate;

function summarizeJsonObject(record: JsonObject, maxEntries: number): string[] {
  return Object.entries(record)
    .filter(([, value]) => value !== undefined && value !== null)
    .slice(0, maxEntries)
    .map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${key}: ${String(value)}`;
      }
      if (Array.isArray(value)) {
        return `${key}: ${value.length} item(s)`;
      }
      if (typeof value === "object") {
        return `${key}: object`;
      }
      return `${key}: ${String(value)}`;
    });
}

function buildGenericAgentBody(context: ReplyRenderContext): string {
  const lines: string[] = [
    `intent: ${context.intent}`,
    `script: ${context.script}`,
  ];

  const summary = summarizeJsonObject(context.result, 6);
  if (summary.length > 0) {
    lines.push(...summary);
  } else {
    lines.push("no structured summary available");
  }

  return lines.join("\n");
}

export function createRouteDrivenAgentTemplate(templateName: string): ReplyTemplate {
  return createWrappedAgentTemplate(templateName, (context) => buildGenericAgentBody(context));
}

interface IntentRoutingRoute {
  reply_template?: unknown;
}

interface IntentRoutingConfig {
  routes?: unknown;
}

export function loadAgentTemplateNamesFromIntentRouting(): string[] {
  const routingPath = path.resolve(__dirname, "../../../../agents/modules/intent-routing.yaml");
  const raw = readFileSync(routingPath, "utf8");
  const parsed = YAML.parse(raw) as IntentRoutingConfig;
  const routes = Array.isArray(parsed.routes) ? parsed.routes : [];

  return Array.from(
    new Set(
      routes
        .filter((item): item is IntentRoutingRoute => typeof item === "object" && item !== null && !Array.isArray(item))
        .map((route) => route.reply_template)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim()),
    ),
  );
}
