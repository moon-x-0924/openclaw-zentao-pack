import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { printJson, type JsonObject, type JsonValue } from "../shared/zentao_client";
import { handleContactSyncPayload, isContactSyncPayload } from "./wecom_contact_sync";
import {
  extractUserid,
  parseJsonInput,
} from "../replies/wecom_task_reply";
import { classifyWecomIntentWithLlm, type LlmIntentDecision } from "./llm_intent_router";

interface CallbackPayload extends JsonObject {
  content?: string;
  text?: string;
  msgtype?: string;
  MsgType?: string;
  body?: JsonValue;
}

interface IntentRoute {
  intent: string;
  triggers: string[];
  script: string;
  requiredArgs: string[];
  requiredArgsAny: string[];
  defaultArgs: Record<string, string>;
}

interface RouteMatch {
  route: IntentRoute;
  trigger: string | null;
}

const INTENT_ROUTING_PATH = path.resolve(__dirname, "../../../agents/modules/intent-routing.yaml");
const PACKAGE_ROOT = path.resolve(__dirname, "../../..");
const BARE_NUMBER_EXECUTION_INTENTS = new Set([
  "query-test-exit-readiness",
  "query-go-live-checklist",
  "query-acceptance-overview",
  "query-closure-readiness",
  "query-closure-items",
  "query-testtasks",
]);
const ENTITY_PATTERNS: Record<string, RegExp[]> = {
  product: [/(?:产品|product)\s*[#：:,-]?\s*(\d+)/giu],
  project: [/(?:项目|project)\s*[#：:,-]?\s*(\d+)/giu],
  execution: [/(?:执行|迭代|sprint|execution)\s*[#：:,-]?\s*(\d+)/giu],
  testtask: [/(?:测试单|测试任务|testtask)\s*[#：:,-]?\s*(\d+)/giu],
  story: [/(?:需求|story)\s*[#：:,-]?\s*(\d+)/giu],
  task: [/(?:任务|task)\s*[#：:,-]?\s*(\d+)/giu],
  bug: [/(?:bug|缺陷)\s*[#：:,-]?\s*(\d+)/giu],
  release: [/(?:发布|release)\s*[#：:,-]?\s*(\d+)/giu],
  run: [/(?:run|执行记录)\s*[#：:,-]?\s*(\d+)/giu],
  case: [/(?:用例|case)\s*[#：:,-]?\s*(\d+)/giu],
  module: [/(?:模块|module)\s*[#：:,-]?\s*(\d+)/giu],
  program: [/(?:项目集|program)\s*[#：:,-]?\s*(\d+)/giu],
};
function getNestedString(record: JsonObject | undefined, keys: string[]): string | undefined {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function toObject(value: JsonValue | undefined): JsonObject | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }
  return undefined;
}

function extractText(payload: CallbackPayload): string {
  return (
    getNestedString(payload, ["content", "text"]) ??
    getNestedString(toObject(payload.body), ["content", "text"]) ??
    getNestedString(toObject(payload.sender), ["content"]) ??
    ""
  );
}

function normalizeText(text: string): string {
  let normalized = text.trim().toLowerCase();
  normalized = normalized.replace(/[，。！？,.!?:：；;]/gu, " ");
  normalized = normalized.replace(/\s+/gu, " ").trim();

  normalized = normalized.replace(/^(帮我|给我|麻烦你|麻烦|请你|请|帮忙)\s*/u, "");
  normalized = normalized.replace(/(帮我|给我|麻烦你|麻烦|请你|请|帮忙)/gu, " ");

  normalized = normalized.replace(/看看/gu, "看");
  normalized = normalized.replace(/看一下/gu, "看");
  normalized = normalized.replace(/看下/gu, "看");
  normalized = normalized.replace(/看一眼/gu, "看");
  normalized = normalized.replace(/查一下/gu, "查");
  normalized = normalized.replace(/查下/gu, "查");
  normalized = normalized.replace(/问一下/gu, "问");
  normalized = normalized.replace(/评估下/gu, "评估");
  normalized = normalized.replace(/确认下/gu, "确认");

  normalized = normalized.replace(/报个\s*bug/gu, "报 bug");
  normalized = normalized.replace(/提个\s*bug/gu, "提 bug");
  normalized = normalized.replace(/建个任务/gu, "创建任务");
  normalized = normalized.replace(/建个产品/gu, "创建产品");
  normalized = normalized.replace(/建个模块/gu, "创建模块");

  normalized = normalized.replace(/^(现在|当前)\s*/u, "");
  normalized = normalized.replace(/\s+/gu, " ").trim();
  return normalized;
}

function parseInlineList(rawValue: string): string[] {
  return rawValue
    .slice(1, -1)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^['\"]|['\"]$/g, ""))
    .filter(Boolean);
}

function parseIntentRoutes(yamlText: string): IntentRoute[] {
  const routes: IntentRoute[] = [];
  const lines = yamlText.replace(/^\uFEFF/, "").split(/\r?\n/);
  let current: IntentRoute | null = null;
  let currentMap: "defaultArgs" | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "    ");
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (line.startsWith("  - intent:")) {
      if (current) {
        routes.push(current);
      }
      current = {
        intent: trimmed.slice("- intent:".length).trim(),
        triggers: [],
        script: "",
        requiredArgs: [],
        requiredArgsAny: [],
        defaultArgs: {},
      };
      currentMap = null;
      continue;
    }

    if (!current) {
      continue;
    }

    if (trimmed.startsWith("triggers:")) {
      const value = trimmed.slice("triggers:".length).trim();
      current.triggers = value.startsWith("[") ? parseInlineList(value) : [];
      currentMap = null;
      continue;
    }

    if (trimmed.startsWith("script:")) {
      current.script = trimmed.slice("script:".length).trim();
      currentMap = null;
      continue;
    }

    if (trimmed.startsWith("required_args_any:")) {
      const value = trimmed.slice("required_args_any:".length).trim();
      current.requiredArgsAny = value.startsWith("[") ? parseInlineList(value) : [];
      currentMap = null;
      continue;
    }

    if (trimmed.startsWith("required_args:")) {
      const value = trimmed.slice("required_args:".length).trim();
      current.requiredArgs = value.startsWith("[") ? parseInlineList(value) : [];
      currentMap = null;
      continue;
    }

    if (trimmed.startsWith("default_args:")) {
      currentMap = "defaultArgs";
      continue;
    }

    if (currentMap === "defaultArgs" && line.startsWith("      ")) {
      const separatorIndex = trimmed.indexOf(":");
      if (separatorIndex > 0) {
        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();
        current.defaultArgs[key] = value;
      }
      continue;
    }

    currentMap = null;
  }

  if (current) {
    routes.push(current);
  }

  return routes.filter((route) => route.intent && route.script);
}

function loadIntentRoutes(): IntentRoute[] {
  return parseIntentRoutes(readFileSync(INTENT_ROUTING_PATH, "utf8"));
}

function findRouteByIntent(intent: string, routes: IntentRoute[]): IntentRoute | null {
  return routes.find((route) => route.intent === intent) ?? null;
}

function findRouteMatch(text: string, routes: IntentRoute[]): RouteMatch | null {
  const normalized = normalizeText(text);
  if (!normalized) {
    return null;
  }

  let best: RouteMatch | null = null;
  for (const route of routes) {
    for (const trigger of route.triggers) {
      const normalizedTrigger = normalizeText(trigger);
      if (!normalizedTrigger) {
        continue;
      }
      if (normalized.includes(normalizedTrigger)) {
        if (!best || normalizedTrigger.length > (best.trigger?.length ?? 0)) {
          best = { route, trigger };
        }
      }
    }
  }

  return best;
}

function extractLastMatch(text: string, expressions: RegExp[]): string | undefined {
  let matchedValue: string | undefined;
  for (const expression of expressions) {
    expression.lastIndex = 0;
    for (const match of text.matchAll(expression)) {
      if (match[1]) {
        matchedValue = match[1];
      }
    }
  }
  return matchedValue;
}

function extractRouteArgs(text: string, route: IntentRoute, userid: string): Record<string, string> {
  const args: Record<string, string> = {};
  if (route.defaultArgs.userid === "current_user") {
    args.userid = userid;
  }
  if (!args.userid) {
    args.userid = userid;
  }

  for (const [name, expressions] of Object.entries(ENTITY_PATTERNS)) {
    const value = extractLastMatch(text, expressions);
    if (value) {
      args[name] = value;
      if (name === "task") {
        args["task-id"] = value;
      }
      if (name === "bug") {
        args["bug-id"] = value;
      }
    }
  }

  const bareNumbers = Array.from(text.matchAll(/(?<![A-Za-z0-9])(\d+)(?![A-Za-z0-9])/g), (match) => match[1]);
  const uniqueBareNumbers = Array.from(new Set(bareNumbers));
  if (uniqueBareNumbers.length === 1) {
    const onlyNumber = uniqueBareNumbers[0];
    const numericRequiredArgs = route.requiredArgs.filter((name) => ENTITY_PATTERNS[name]);
    if (numericRequiredArgs.length === 1 && !args[numericRequiredArgs[0]]) {
      args[numericRequiredArgs[0]] = onlyNumber;
      if (numericRequiredArgs[0] === "task") {
        args["task-id"] = onlyNumber;
      }
      if (numericRequiredArgs[0] === "bug") {
        args["bug-id"] = onlyNumber;
      }
    }

    if (BARE_NUMBER_EXECUTION_INTENTS.has(route.intent)) {
      if (!args.execution && !args.testtask && !args.project && !args.product) {
        args.execution = onlyNumber;
      }
    }
  }

  const taskStatusHints: Array<[RegExp, string]> = [
    [/(开始任务|进行任务|doing)/iu, "doing"],
    [/(完成任务|done)/iu, "done"],
    [/(关闭任务|closed)/iu, "closed"],
    [/(激活任务|activate)/iu, "activate"],
    [/(暂停任务|pause)/iu, "pause"],
  ];
  if (route.intent === "update-task-status" && !args.status) {
    for (const [expression, status] of taskStatusHints) {
      if (expression.test(text)) {
        args.status = status;
        break;
      }
    }
  }

  const bugStatusHints: Array<[RegExp, string]> = [
    [/(解决bug|解决缺陷|resolve)/iu, "resolved"],
    [/(关闭bug|关闭缺陷|closed)/iu, "closed"],
    [/(激活bug|激活缺陷|activate)/iu, "active"],
  ];
  if (route.intent === "update-bug-status" && !args.status) {
    for (const [expression, status] of bugStatusHints) {
      if (expression.test(text)) {
        args.status = status;
        break;
      }
    }
  }

  return args;
}

function normalizeRouteArgs(value: JsonObject | undefined): Record<string, string> {
  if (!value) {
    return {};
  }

  const args: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null) {
      continue;
    }
    const normalized = String(raw).trim();
    if (!normalized) {
      continue;
    }
    args[key] = normalized;
  }

  if (args.task && !args["task-id"]) {
    args["task-id"] = args.task;
  }
  if (args.bug && !args["bug-id"]) {
    args["bug-id"] = args.bug;
  }

  return args;
}

function collectMissingArgs(route: IntentRoute, args: Record<string, string>): string[] {
  const missing = route.requiredArgs.filter((name) => !args[name]);
  if (route.requiredArgsAny.length > 0 && !route.requiredArgsAny.some((name) => Boolean(args[name]))) {
    missing.push(route.requiredArgsAny.join(" / "));
  }
  return missing;
}

function buildRouteHelpText(routes: IntentRoute[]): string {
  const examples = routes.slice(0, 10).flatMap((route) => route.triggers.slice(0, 1));
  return [
    "已识别为禅道机器人指令入口。",
    "当前优先按 intent-routing.yaml 做快速路由。",
    "可直接尝试：",
    ...examples.map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");
}

function buildMissingArgsReply(route: IntentRoute, missingArgs: string[]): string {
  return [
    `已识别为禅道指令：${route.intent}`,
    `当前缺少必要参数：${missingArgs.join("、")}`,
    "请补充最小必要信息后重试。",
  ].join("\n");
}

function toCliArgs(args: Record<string, string>): string[] {
  const entries = Object.entries(args).filter(([, value]) => typeof value === "string" && value.trim());
  const cliArgs: string[] = [];
  for (const [key, value] of entries) {
    cliArgs.push(`--${key}`, value);
  }
  return cliArgs;
}

function runScript(route: IntentRoute, args: Record<string, string>): JsonObject {
  try {
    const output = execFileSync("npm", ["run", "--silent", route.script, "--", ...toCliArgs(args)], {
      cwd: PACKAGE_ROOT,
      encoding: "utf8",
    }).trim();
    return parseJsonInput(output, `npm run ${route.script}`) as JsonObject;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: message,
      route_script: route.script,
      route_args: args,
    } satisfies JsonObject;
  }
}

function summarizeItems(items: JsonObject[], keys: string[], maxLines = 8): string[] {
  return items.slice(0, maxLines).map((item, index) => {
    const parts = keys
      .map((key) => {
        const value = item[key];
        if (value === undefined || value === null || value === "") {
          return null;
        }
        return `${key}=${String(value)}`;
      })
      .filter((value): value is string => Boolean(value));
    return `${index + 1}. ${parts.join(" | ")}`;
  });
}

function buildReplyTextFromScriptResult(route: IntentRoute, result: JsonObject): string {
  if (typeof result.reply_text === "string" && result.reply_text.trim()) {
    return result.reply_text.trim();
  }

  if (route.intent === "query-test-exit-readiness") {
    const ready = result.ready_for_exit === true ? "可以准出" : "暂不建议准出";
    const blockers = Array.isArray(result.blockers) ? result.blockers.map(String) : [];
    return [
      `测试准出结果：${ready}`,
      blockers.length > 0 ? `阻塞项：${blockers.join("、")}` : "阻塞项：无",
    ].join("\n");
  }

  const tasksValue = result.tasks;
  if (Array.isArray(tasksValue)) {
    const tasks = tasksValue.filter((item): item is JsonObject => typeof item === "object" && item !== null && !Array.isArray(item));
    const statusCounts = result.status_counts && typeof result.status_counts === "object" && !Array.isArray(result.status_counts)
      ? Object.entries(result.status_counts).map(([key, value]) => `${key}:${String(value)}`).join('，')
      : '';
    const header = statusCounts ? `我的任务共 ${tasks.length} 条（${statusCounts}）` : `我的任务共 ${tasks.length} 条`;
    return [header, ...summarizeItems(tasks, ["id", "name", "status", "assignedTo", "execution", "deadline"])].join("\n");
  }

  const itemsValue = result.items;
  if (Array.isArray(itemsValue)) {
    const items = itemsValue.filter((item): item is JsonObject => typeof item === "object" && item !== null && !Array.isArray(item));
    if (route.intent === 'query-my-bugs') {
      return [`我的 Bug 共 ${items.length} 条`, ...summarizeItems(items, ["id", "title", "status", "assignedTo", "openedBy", "resolvedBy"])].join("\n");
    }
    const title = typeof result.title === "string" && result.title.trim() ? result.title.trim() : `${route.intent} 结果`;
    return [title, `数量：${typeof result.count === "number" ? result.count : items.length}`, ...summarizeItems(items, ["id", "name", "title", "status", "assignedTo", "PM"])].join("\n");
  }

  const detailKeys = ["id", "name", "title", "status", "assignedTo", "openedBy", "date"];
  const detailParts = detailKeys
    .map((key) => {
      const value = result[key];
      if (value === undefined || value === null || value === "") {
        return null;
      }
      return `${key}=${String(value)}`;
    })
    .filter((value): value is string => Boolean(value));
  if (detailParts.length > 0) {
    return detailParts.join("\n");
  }

  return `已执行禅道脚本：${route.script}`;
}

async function dispatchRoute(match: RouteMatch, text: string, userid: string, payload: CallbackPayload, values: Record<string, string | boolean | undefined>, resolvedArgs?: Record<string, string>): Promise<JsonObject> {
  const { route } = match;

  const args = resolvedArgs ?? extractRouteArgs(text, route, userid);
  const missingArgs = collectMissingArgs(route, args);
  if (missingArgs.length > 0) {
    return {
      ok: true,
      userid,
      intent: route.intent,
      matched_by: match.trigger,
      route_script: route.script,
      route_args: args,
      missing_args: missingArgs,
      reply_text: buildMissingArgsReply(route, missingArgs),
    };
  }

  const scriptResult = runScript(route, args);
  return {
    ...scriptResult,
    ok: scriptResult.ok === undefined ? true : scriptResult.ok,
    userid,
    intent: route.intent,
    matched_by: match.trigger,
    route_script: route.script,
    route_args: args,
    reply_text: scriptResult.ok === false
      ? `已识别为禅道指令：${route.intent}\n执行脚本失败：${typeof scriptResult.error === "string" ? scriptResult.error : "unknown error"}`
      : buildReplyTextFromScriptResult(route, scriptResult),
  };
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      userid: { type: "string" },
      data: { type: "string" },
      "data-file": { type: "string" },
      status: { type: "string", default: "all" },
      limit: { type: "string" },
      "page-size": { type: "string" },
      "max-lines": { type: "string", default: "10" },
      "sync-user": { type: "boolean", default: true },
    },
    allowPositionals: false,
  });

  const payload = (values["data-file"]
    ? parseJsonInput(readFileSync(values["data-file"], "utf8"), values["data-file"])
    : values.data
      ? parseJsonInput(values.data, "--data")
      : {}) as CallbackPayload;

  const userid = values.userid ?? extractUserid(payload);
  const text = extractText(payload);
  const routes = loadIntentRoutes();

  if (isContactSyncPayload(payload)) {
    const result = await handleContactSyncPayload(payload);
    printJson(result);
    return;
  }

  if (!userid) {
    throw new Error("Cannot determine WeCom userid from callback payload.");
  }

  const valuesRecord = values as Record<string, string | boolean | undefined>;
  const match = findRouteMatch(text, routes);
  if (match) {
    const result = await dispatchRoute(match, text, userid, payload, valuesRecord);
    printJson({
      ...result,
      route_source: "yaml",
    });
    return;
  }

  const llmDecision = await classifyWecomIntentWithLlm({
    text,
    userid,
    routes,
  });

  if (llmDecision?.is_zentao_request && typeof llmDecision.intent === "string" && llmDecision.intent.trim()) {
    const route = findRouteByIntent(llmDecision.intent, routes);
    if (route) {
      const llmArgs = normalizeRouteArgs(llmDecision.args as JsonObject | undefined);
      const mergedArgs = {
        ...extractRouteArgs(text, route, userid),
        ...llmArgs,
      };
      const result = await dispatchRoute({ route, trigger: "llm" }, text, userid, payload, valuesRecord, mergedArgs);
      printJson({
        ...result,
        route_source: "llm",
        llm_decision: llmDecision satisfies LlmIntentDecision,
      });
      return;
    }
  }

  printJson({
    ok: true,
    userid,
    intent: "non_zentao_or_unknown",
    input_text: text,
    reply_text: buildRouteHelpText(routes),
    should_fallback_to_general_ai: true,
    route_source: llmDecision ? "llm_non_zentao" : "yaml_miss",
    llm_decision: llmDecision,
  });
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
