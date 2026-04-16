import { readFileSync } from "node:fs";
import path from "node:path";
import { type JsonObject } from "../shared/zentao_client";

export interface IntentRoute {
  intent: string;
  triggers: string[];
  script: string;
  requiredArgs: string[];
  requiredArgsAny: string[];
  optionalArgs: string[];
  defaultArgs: Record<string, string>;
  replyTemplate?: string;
}

export interface RouteMatch {
  route: IntentRoute;
  trigger: string | null;
}

const INTENT_ROUTING_PATH = path.resolve(__dirname, "../../../agents/modules/intent-routing.yaml");
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
const ENTITY_ID_ARG_NAMES = new Set(Object.keys(ENTITY_PATTERNS).concat(["build"]));
const KEYWORD_EXISTENCE_PREFIXES = ["有没有", "是否有", "有无", "有哪些", "有什么", "有啥", "有"];
const KEYWORD_SEARCH_VERBS = ["查询", "查看", "搜索", "查", "看", "搜", "找"];
const KEYWORD_LIST_SUFFIXES = ["列表", "清单"];

function normalizeText(text: string): string {
  let normalized = text.trim().toLowerCase();
  normalized = normalized.replace(/[，。！？,.!?:：；;]/gu, " ");
  normalized = normalized.replace(/\s+/gu, " ").trim();
  normalized = normalized.replace(/@\S+/gu, " ").replace(/\s+/gu, " ").trim();

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
  normalized = normalized.replace(/提个\s*需求/gu, "提需求");
  normalized = normalized.replace(/提一个\s*需求/gu, "提需求");
  normalized = normalized.replace(/建个\s*需求/gu, "创建需求");
  normalized = normalized.replace(/建一个\s*需求/gu, "创建需求");
  normalized = normalized.replace(/建个任务/gu, "创建任务");
  normalized = normalized.replace(/建个产品/gu, "创建产品");
  normalized = normalized.replace(/建个模块/gu, "创建模块");
  normalized = normalized.replace(/看我的任务/gu, "我的任务");
  normalized = normalized.replace(/查我的任务/gu, "我的任务");
  normalized = normalized.replace(/看下我的任务/gu, "我的任务");
  normalized = normalized.replace(/查下我的任务/gu, "我的任务");
  normalized = normalized.replace(/看一下我的任务/gu, "我的任务");
  normalized = normalized.replace(/查一下我的任务/gu, "我的任务");
  normalized = normalized.replace(/看我的bug/gu, "我的bug");
  normalized = normalized.replace(/查我的bug/gu, "我的bug");
  normalized = normalized.replace(/看下我的bug/gu, "我的bug");
  normalized = normalized.replace(/查下我的bug/gu, "我的bug");
  normalized = normalized.replace(/看一下我的bug/gu, "我的bug");
  normalized = normalized.replace(/查一下我的bug/gu, "我的bug");
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
    .map((item) => item.replace(/^['"]|['"]$/g, ""))
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
        optionalArgs: [],
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

    if (trimmed.startsWith("optional_args:")) {
      const value = trimmed.slice("optional_args:".length).trim();
      current.optionalArgs = value.startsWith("[") ? parseInlineList(value) : [];
      currentMap = null;
      continue;
    }

    if (trimmed.startsWith("reply_template:")) {
      current.replyTemplate = trimmed.slice("reply_template:".length).trim();
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

export function loadIntentRoutes(): IntentRoute[] {
  return parseIntentRoutes(readFileSync(INTENT_ROUTING_PATH, "utf8"));
}

export function findRouteByIntent(intent: string, routes: IntentRoute[]): IntentRoute | null {
  return routes.find((route) => route.intent === intent) ?? null;
}

export function findRouteMatch(text: string, routes: IntentRoute[]): RouteMatch | null {
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

function extractAssignedTo(text: string): string | undefined {
  const directMatch = extractLastMatch(text, [
    /(?:assigned-to|assignedto)\s*[#:= -]?\s*([^\s,.;:]+)/giu,
  ]);
  if (directMatch) {
    return directMatch;
  }

  const ownerToken = "\u8d1f\u8d23\u4eba";
  const giveToken = "\u7ed9";

  const ownerIndex = text.lastIndexOf(ownerToken);
  if (ownerIndex >= 0) {
    const tail = text.slice(ownerIndex + ownerToken.length).trimStart().replace(/^[#:= -]+/u, "");
    const match = tail.match(/^\S+/u);
    if (match?.[0]) {
      return match[0];
    }
  }

  const giveIndex = text.lastIndexOf(giveToken);
  if (giveIndex >= 0) {
    const tail = text.slice(giveIndex + giveToken.length).trimStart();
    const match = tail.match(/^\S+/u);
    if (match?.[0]) {
      return match[0];
    }
  }

  return undefined;
}

function cleanLabeledValue(rawValue: string): string | undefined {
  const normalized = rawValue
    .trim()
    .replace(/^[：:，,\s]+/gu, "")
    .replace(/[，,\s]+$/gu, "")
    .trim();
  return normalized || undefined;
}

function trimStoryFieldValue(rawValue: string, fieldName: "title" | "spec" | "verify" | "reviewer"): string | undefined {
  let normalized = cleanLabeledValue(rawValue) ?? "";
  if (!normalized) {
    return undefined;
  }

  if (fieldName === "reviewer") {
    normalized = normalized
      .replace(/(?:创建|新建|新增|提)(?:需求|story)\s*$/iu, "")
      .replace(/(?:就行|即可|就好|好了)\s*$/iu, "")
      .trim();
  }

  normalized = normalized.replace(/[，,。；;]+$/gu, "").trim();
  return normalized || undefined;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPhraseRegexSource(value: string): string {
  return value
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map((part) => escapeRegex(part))
    .join("\\s*");
}

function extractStoryCreateField(
  text: string,
  fieldName: "title" | "spec" | "verify" | "reviewer",
  labels: string[],
  nextLabels: string[],
): string | undefined {
  const labelSource = labels.map((label) => escapeRegex(label)).join("|");
  const nextLabelSource = nextLabels.map((label) => escapeRegex(label)).join("|");
  const pattern = nextLabelSource
    ? new RegExp(`(?:${labelSource})\\s*[叫是为:]?\\s*(.+?)(?=(?:[，,；;。]\\s*)?(?:${nextLabelSource})|$)`, "iu")
    : new RegExp(`(?:${labelSource})\\s*[叫是为:]?\\s*(.+)$`, "iu");
  const matched = text.match(pattern);
  return trimStoryFieldValue(matched?.[1] ?? "", fieldName);
}

function extractCreateStoryArgs(text: string): Record<string, string> {
  const args: Record<string, string> = {};
  const labels = {
    title: ["标题叫", "标题是", "标题为", "标题"],
    spec: ["需求描述是", "需求描述为", "需求描述", "描述是", "描述为", "描述"],
    verify: ["验收标准是", "验收标准为", "验收标准"],
    reviewer: ["评审人先填", "评审人是", "评审人填", "评审人", "评审先给", "评审给"],
  };

  const title = extractStoryCreateField(text, "title", labels.title, [...labels.spec, ...labels.verify, ...labels.reviewer]);
  if (title) {
    args.title = title;
  }

  const spec = extractStoryCreateField(text, "spec", labels.spec, [...labels.verify, ...labels.reviewer]);
  if (spec) {
    args.spec = spec;
  }

  const verify = extractStoryCreateField(text, "verify", labels.verify, labels.reviewer);
  if (verify) {
    args.verify = verify;
  }

  const reviewer = extractStoryCreateField(text, "reviewer", labels.reviewer, []);
  if (reviewer) {
    args.reviewer = reviewer;
  }

  return args;
}

function extractProductSetupName(text: string): string | undefined {
  const patterns = [
    /(?:^|[，,；;\s])(?:叫|名称(?:叫|是|为)?|产品名(?:叫|是|为)?|名字(?:叫|是|为)?)\s*([^\n，。,；;]+?)(?=(?:[，,；;。]\s*)?(?:顺手把模块也建好|把模块也建好|模块也建好|模块[:：]|产品负责人|测试负责人|研发负责人|描述|说明|$))/iu,
    /(?:创建|新建|新增|建)(?:一个)?产品\s*([^\n，。,；;]+?)(?=(?:[，,；;。]\s*)?(?:顺手把模块也建好|把模块也建好|模块也建好|模块[:：]|产品负责人|测试负责人|研发负责人|描述|说明|$))/iu,
  ];

  for (const pattern of patterns) {
    const matched = text.match(pattern);
    const value = cleanLabeledValue(matched?.[1] ?? "");
    if (value) {
      return value;
    }
  }

  return undefined;
}

function extractDelimitedNames(rawValue: string): string[] {
  return rawValue
    .split(/[、,，]/u)
    .map((item) => cleanLabeledValue(item) ?? "")
    .filter(Boolean);
}

function extractProductSetupModules(text: string): string[] {
  const patterns = [
    /(?:顺手把模块也建好|把模块也建好|模块也建好|模块建好)\s*[:：]?\s*(.+?)(?=(?:[，,；;。]\s*)?(?:产品负责人|测试负责人|研发负责人|负责人|描述|说明|$))/iu,
    /(?:模块)\s*[:：]\s*(.+?)(?=(?:[，,；;。]\s*)?(?:产品负责人|测试负责人|研发负责人|负责人|描述|说明|$))/iu,
  ];

  for (const pattern of patterns) {
    const matched = text.match(pattern);
    const modules = extractDelimitedNames(matched?.[1] ?? "");
    if (modules.length > 0) {
      return modules;
    }
  }

  return [];
}

function extractRoleOwner(text: string, labels: string[]): string | undefined {
  const labelSource = labels.map((label) => escapeRegex(label)).join("|");
  const matched = text.match(new RegExp(`(?:${labelSource})(?:先)?(?:给|是|为|填|安排给|设置为)?\\s*([^\\s，。,；;]+)`, "iu"));
  return cleanLabeledValue(matched?.[1] ?? "");
}

function extractCreateProductSetupArgs(text: string): Record<string, string> {
  const args: Record<string, string> = {};
  const name = extractProductSetupName(text);
  if (name) {
    args.name = name;
  }

  const modules = extractProductSetupModules(text);
  if (modules.length > 0) {
    args.modules = modules.join(",");
  }

  const sharedOwnerMatch = text.match(
    /产品负责人\s*[、,，]\s*测试负责人\s*[、,，]\s*研发负责人(?:先)?(?:都)?(?:给|是|为|填|安排给|设置为)\s*([^\s，。,；;]+)/iu,
  );
  const sharedOwner = cleanLabeledValue(sharedOwnerMatch?.[1] ?? "");
  if (sharedOwner) {
    args.po = sharedOwner;
    args.qd = sharedOwner;
    args.rd = sharedOwner;
  } else {
    const po = extractRoleOwner(text, ["产品负责人", "po"]);
    const qd = extractRoleOwner(text, ["测试负责人", "qd"]);
    const rd = extractRoleOwner(text, ["研发负责人", "rd"]);
    if (po) {
      args.po = po;
    }
    if (qd) {
      args.qd = qd;
    }
    if (rd) {
      args.rd = rd;
    }
  }

  const reviewer = extractRoleOwner(text, ["评审负责人", "评审人", "reviewer"]);
  if (reviewer) {
    args.reviewer = reviewer;
  }

  const descMatch = text.match(/(?:描述|说明)(?:是|为|[:：])\s*(.+)$/iu);
  const desc = cleanLabeledValue(descMatch?.[1] ?? "");
  if (desc) {
    args.desc = desc;
  }

  return args;
}

function compactNormalizedText(text: string): string {
  return normalizeText(text).replace(/\s+/gu, "");
}

function stripKeywordAliasDecorators(rawValue: string): string {
  let normalized = rawValue.trim();
  let previous = "";

  while (normalized && normalized !== previous) {
    previous = normalized;
    normalized = normalized
      .replace(/^(帮我|给我|麻烦你|麻烦|请你|请|帮忙)\s*/iu, "")
      .replace(/^(查询|查看|搜索|查一下|查下|查|看一下|看下|看看|看|搜一下|搜下|搜|找一下|找下|找)\s*/iu, "")
      .replace(/^(有哪些|有什么|有啥|我的|我负责的|当前|现在|这个|该)\s*/iu, "")
      .replace(/(?:列表|清单|详情|明细|概览|总览|情况)\s*$/iu, "")
      .trim();
  }

  return normalized;
}

function buildRouteKeywordContext(route: IntentRoute): { aliases: string[]; noisePhrases: Set<string> } {
  const aliasMap = new Map<string, string>();
  const noisePhrases = new Set<string>();

  for (const trigger of route.triggers) {
    const compactTrigger = compactNormalizedText(trigger);
    if (compactTrigger) {
      noisePhrases.add(compactTrigger);
    }

    const alias = stripKeywordAliasDecorators(trigger);
    const compactAlias = compactNormalizedText(alias);
    if (!compactAlias) {
      continue;
    }
    if (!aliasMap.has(compactAlias)) {
      aliasMap.set(compactAlias, alias);
    }
  }

  const aliases = Array.from(aliasMap.values()).sort((left, right) => right.length - left.length);
  for (const alias of aliases) {
    const compactAlias = compactNormalizedText(alias);
    noisePhrases.add(compactAlias);
    for (const prefix of KEYWORD_EXISTENCE_PREFIXES) {
      noisePhrases.add(compactNormalizedText(`${prefix}${alias}`));
    }
    for (const verb of KEYWORD_SEARCH_VERBS) {
      noisePhrases.add(compactNormalizedText(`${verb}${alias}`));
    }
    for (const suffix of KEYWORD_LIST_SUFFIXES) {
      noisePhrases.add(compactNormalizedText(`${alias}${suffix}`));
    }
  }

  return { aliases, noisePhrases };
}

function normalizeKeywordCandidate(rawValue: string, route: IntentRoute): string | undefined {
  const normalized = rawValue
    .trim()
    .replace(/^[：:，,。！？!?、\s]+/gu, "")
    .replace(/[。！？!?、\s]+$/gu, "")
    .replace(/^(有没有|是否有|有无|有哪些|有什么|有啥|有)\s*/u, "")
    .replace(/^(帮我|给我|麻烦你|麻烦|请你|请|帮忙)\s*/u, "")
    .trim();

  const compactCandidate = compactNormalizedText(normalized);
  if (!compactCandidate) {
    return undefined;
  }

  const { noisePhrases } = buildRouteKeywordContext(route);
  if (noisePhrases.has(compactCandidate)) {
    return undefined;
  }

  return normalized;
}

function extractRouteKeywords(text: string, route: IntentRoute): string | undefined {
  const { aliases } = buildRouteKeywordContext(route);
  if (aliases.length === 0) {
    return undefined;
  }

  const existencePrefixSource = KEYWORD_EXISTENCE_PREFIXES
    .slice()
    .sort((left, right) => right.length - left.length)
    .map((item) => escapeRegex(item))
    .join("|");
  const searchVerbSource = KEYWORD_SEARCH_VERBS
    .slice()
    .sort((left, right) => right.length - left.length)
    .map((item) => escapeRegex(item))
    .join("|");

  for (const alias of aliases) {
    const aliasSource = buildPhraseRegexSource(alias);
    const patterns = [
      new RegExp(`(?:${aliasSource}(?:列表|清单)?)(?:里|中)?(?:${existencePrefixSource})\\s*["“”'‘’]?(.+?)["“”'‘’]?(?:\\?|？)?$`, "iu"),
      new RegExp(`(?:${searchVerbSource})(?:一下|下)?\\s*["“”'‘’]?(.+?)["“”'‘’]?(?:这个|该)?${aliasSource}(?:\\?|？)?$`, "iu"),
      new RegExp(`(?:${searchVerbSource})(?:一下|下)?${aliasSource}\\s*["“”'‘’]?(.+?)["“”'‘’]?(?:\\?|？)?$`, "iu"),
    ];

    for (const pattern of patterns) {
      const matched = text.match(pattern);
      const candidate = normalizeKeywordCandidate(matched?.[1] ?? "", route);
      if (candidate) {
        return candidate;
      }
    }
  }

  return undefined;
}

export function extractRouteArgs(text: string, route: IntentRoute, userid: string): Record<string, string> {
  const args: Record<string, string> = {};
  if (route.defaultArgs.userid === "current_user") {
    args.userid = userid;
  }
  if (!args.userid) {
    args.userid = userid;
  }

  for (const [name, expressions] of Object.entries(ENTITY_PATTERNS)) {
    if ((route.intent === "create-product" || route.intent === "create-product-with-modules") && name === "product") {
      continue;
    }
    const value = extractLastMatch(text, expressions);
    if (value) {
      args[name] = value;
    }
  }

  if (route.intent === "assign-bug" && !args["assigned-to"]) {
    const assignedTo = extractAssignedTo(text);
    if (assignedTo) {
      args["assigned-to"] = assignedTo;
    }
  }

  if (route.intent === "create-story") {
    const storyArgs = extractCreateStoryArgs(text);
    for (const [key, value] of Object.entries(storyArgs)) {
      if (!args[key] && value) {
        args[key] = value;
      }
    }
  }

  if (route.intent === "create-product" || route.intent === "create-product-with-modules") {
    const productSetupArgs = extractCreateProductSetupArgs(text);
    for (const [key, value] of Object.entries(productSetupArgs)) {
      if (!args[key] && value) {
        args[key] = value;
      }
    }
  }

  if (route.optionalArgs.includes("keywords") && !args.keywords) {
    const keywords = extractRouteKeywords(text, route);
    if (keywords) {
      args.keywords = keywords;
    }
  }

  return args;
}

export function normalizeRouteArgs(value: JsonObject | undefined): Record<string, string> {
  if (!value) {
    return {};
  }

  const args: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null) {
      continue;
    }
    let normalized = String(raw).trim();
    if (!normalized) {
      continue;
    }
    if (ENTITY_ID_ARG_NAMES.has(key)) {
      const numericMatch = normalized.match(/\d+/u);
      if (numericMatch?.[0]) {
        normalized = numericMatch[0];
      }
    }
    args[key] = normalized;
  }

  return args;
}

export function collectMissingArgs(route: IntentRoute, args: Record<string, string>): string[] {
  const missing = route.requiredArgs.filter((name) => !args[name]);
  if (route.requiredArgsAny.length > 0 && !route.requiredArgsAny.some((name) => Boolean(args[name]))) {
    missing.push(route.requiredArgsAny.join(" / "));
  }
  return missing;
}
