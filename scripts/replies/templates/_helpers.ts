import type { JsonObject } from "../../shared/zentao_client";
import type { ReplyRenderContext, ReplyTemplate } from "../template_types";

export interface LineFieldConfig {
  label: string;
  path: string;
  fallback?: string;
  hideIfMissing?: boolean;
}

export interface DetailSectionConfig {
  label: string;
  fields?: LineFieldConfig[];
  path?: string;
  formatter?: (context: ReplyRenderContext) => string | undefined;
}

export interface ActionSectionConfig {
  label: string;
  path?: string;
  formatter?: (context: ReplyRenderContext) => string | undefined;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getNestedValue(record: unknown, path: string): unknown {
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

    if (!isObject(current)) {
      return undefined;
    }

    current = current[part];
  }

  return current;
}

export function asText(value: unknown, fallback = "-"): string {
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
    return value.map((item) => asText(item, "")).filter(Boolean).join(", ") || fallback;
  }

  if (isObject(value)) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null && String(item).trim() !== "")
      .map(([key, item]) => `${key}:${String(item).trim()}`);
    return entries.join(" | ") || fallback;
  }

  return fallback;
}

export function asObjectArray(value: unknown): JsonObject[] {
  if (Array.isArray(value)) {
    return value.filter(isObject);
  }
  if (isObject(value)) {
    return Object.values(value).filter(isObject);
  }
  return [];
}

export function section(label: string, value: string): string {
  return `【${label}】${value}`;
}

export function formatLineFields(record: unknown, fields: LineFieldConfig[], separator = " | "): string {
  const parts = fields
    .map((field) => {
      const raw = getNestedValue(record, field.path);
      const text = asText(raw, field.fallback ?? "-");
      if (field.hideIfMissing && text === (field.fallback ?? "-")) {
        return "";
      }
      return `${field.label}：${text}`;
    })
    .filter(Boolean);

  return parts.join(separator);
}

export function summarizePlainText(value: unknown, maxLength = 120): string {
  const text = asText(value, "-")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text === "-") return "-";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function getDisplayUser(context: ReplyRenderContext): string {
  return asText(
    getNestedValue(context.result, "wecom_user.name") ??
      getNestedValue(context.result, "userid") ??
      context.userid,
    "未知用户",
  );
}

export function getDisplayRole(context: ReplyRenderContext): string {
  return asText(
    getNestedValue(context.result, "matched_user.role") ??
      getNestedValue(context.result, "matched_user.account") ??
      getNestedValue(context.result, "matched_user.realname"),
    "未匹配",
  );
}

export function renderListSection(
  label: string,
  items: JsonObject[],
  formatter: (item: JsonObject, index: number) => string,
  emptyMessage: string,
  limit = 10,
): string[] {
  const lines = [section(label, "")];
  if (items.length === 0) {
    lines.push(emptyMessage);
    return lines;
  }

  items.slice(0, limit).forEach((item, index) => {
    lines.push(formatter(item, index));
  });

  return lines;
}

export function createDetailTemplate(
  name: string,
  titleBuilder: (context: ReplyRenderContext) => string,
  sectionsConfig: DetailSectionConfig[],
): ReplyTemplate {
  return {
    name,
    render(context) {
      const lines = [titleBuilder(context)];

      for (const config of sectionsConfig) {
        let content = "";
        if (config.formatter) {
          content = config.formatter(context) ?? "";
        } else if (config.fields) {
          const base = config.path ? getNestedValue(context.result, config.path) : context.result;
          content = formatLineFields(base, config.fields, "；");
        } else if (config.path) {
          content = summarizePlainText(getNestedValue(context.result, config.path), 240);
        }

        lines.push(section(config.label, content || "-"));
      }

      return lines.join("\n");
    },
  };
}

export function createActionTemplate(
  name: string,
  titleBuilder: (context: ReplyRenderContext) => string,
  sectionsConfig: ActionSectionConfig[],
): ReplyTemplate {
  return {
    name,
    render(context) {
      const lines = [titleBuilder(context)];
      for (const config of sectionsConfig) {
        const content = config.formatter
          ? config.formatter(context)
          : summarizePlainText(getNestedValue(context.result, config.path ?? ""), 200);
        lines.push(section(config.label, content || "-"));
      }
      return lines.join("\n");
    },
  };
}
