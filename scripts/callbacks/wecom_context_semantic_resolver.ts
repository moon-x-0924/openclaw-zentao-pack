import { loadWecomSessionContext, type ContextEntityName } from "../shared/wecom_session_context_store";
import { findRouteByIntent, type IntentRoute, type RouteMatch } from "./wecom_route_resolver";

type SemanticEntity = ContextEntityName | "module" | "team";
type SemanticAction = "detail" | "list";

interface SemanticIntentRule {
  intent: string;
  action: SemanticAction;
  entity: SemanticEntity;
  parent?: ContextEntityName;
}

export interface SemanticRouteResolution {
  match: RouteMatch;
  reason: string;
}

const CONTEXT_REFERENCE_WORDS = ["这个", "该", "当前", "目前", "此", "刚才", "上面", "上一个", "最近"];
const RELATION_WORDS = ["下面", "下边", "下面的", "下的", "里面", "里边", "里的", "中的", "中", "内", "相关", "关联", "所属"];
const LIST_WORDS = ["列表", "清单", "有哪些", "有什么", "有啥", "包含", "包含哪些", "都有哪些", "列出", "全部", "所有"];
const DETAIL_WORDS = ["详情", "明细", "概览", "总览", "信息", "情况", "看看", "查看", "查", "看", "打开", "显示"];
const CREATE_VERBS = ["创建", "新建", "新增", "提", "建", "加"];
const CONTEXT_PRIORITY: ContextEntityName[] = ["testtask", "execution", "project", "product", "release", "story", "task", "bug"];

const ENTITY_SYNONYMS: Record<SemanticEntity, string[]> = {
  product: ["产品", "product"],
  project: ["项目", "project"],
  execution: ["测试迭代", "项目迭代", "迭代", "执行", "sprint", "execution"],
  testtask: ["测试任务", "测试单", "提测单", "testtask"],
  story: ["需求", "story"],
  task: ["任务", "task"],
  bug: ["bug", "缺陷"],
  release: ["发布", "版本", "release"],
  case: ["测试用例", "用例", "case"],
  run: ["执行记录", "执行结果", "run"],
  module: ["模块", "module"],
  team: ["团队", "成员"],
};
const CREATE_ENTITY_TYPES: SemanticEntity[] = ["story", "task", "bug", "testtask", "product", "module", "release", "case"];

const SEMANTIC_INTENT_RULES: SemanticIntentRule[] = [
  { intent: "query-product-overview", action: "detail", entity: "product" },
  { intent: "query-testtask-detail", action: "detail", entity: "testtask" },
  { intent: "query-story-detail", action: "detail", entity: "story" },
  { intent: "query-task-detail", action: "detail", entity: "task" },
  { intent: "query-bug-detail", action: "detail", entity: "bug" },
  { intent: "query-release-detail", action: "detail", entity: "release" },
  { intent: "query-product-modules", action: "list", parent: "product", entity: "module" },
  { intent: "query-product-stories", action: "list", parent: "product", entity: "story" },
  { intent: "query-testcases", action: "list", parent: "product", entity: "case" },
  { intent: "query-releases", action: "list", parent: "product", entity: "release" },
  { intent: "query-executions", action: "list", parent: "project", entity: "execution" },
  { intent: "query-project-team", action: "list", parent: "project", entity: "team" },
  { intent: "query-execution-stories", action: "list", parent: "execution", entity: "story" },
  { intent: "query-execution-tasks", action: "list", parent: "execution", entity: "task" },
  { intent: "query-execution-team", action: "list", parent: "execution", entity: "team" },
  { intent: "query-testtasks", action: "list", parent: "execution", entity: "testtask" },
  { intent: "query-testtask-cases", action: "list", parent: "testtask", entity: "case" },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/@\S+/gu, " ")
    .replace(/[，。！？,.!?:：；;（）()【】\[\]{}<>《》"'“”‘’`~\-_/\\|]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function compactText(text: string): string {
  return normalizeText(text).replace(/\s+/gu, "");
}

function buildAlternation(values: string[]): string {
  return values
    .slice()
    .sort((left, right) => right.length - left.length)
    .map((value) => escapeRegExp(value))
    .join("|");
}

function buildEntityPattern(entity: SemanticEntity): string {
  return `(?:${buildAlternation(ENTITY_SYNONYMS[entity])})`;
}

function containsReferenceWord(text: string): boolean {
  return CONTEXT_REFERENCE_WORDS.some((word) => text.includes(word));
}

function containsListSignal(text: string): boolean {
  return LIST_WORDS.some((word) => text.includes(word)) || RELATION_WORDS.some((word) => text.includes(word));
}

function containsDetailSignal(text: string): boolean {
  return DETAIL_WORDS.some((word) => text.includes(word));
}

function containsCreateIntent(text: string): boolean {
  const entitySource = buildAlternation(
    CREATE_ENTITY_TYPES.flatMap((entity) => ENTITY_SYNONYMS[entity]),
  );
  return new RegExp(`(?:${buildAlternation(CREATE_VERBS)})\\s*(?:个|一个)?\\s*(?:${entitySource})`, "iu").test(text);
}

function hasEntityMention(text: string, entity: SemanticEntity): boolean {
  return new RegExp(buildEntityPattern(entity), "iu").test(text);
}

function hasReferencedEntity(text: string, entity: SemanticEntity): boolean {
  const referenceSource = buildAlternation(CONTEXT_REFERENCE_WORDS);
  return new RegExp(`(?:${referenceSource})\\s*${buildEntityPattern(entity)}`, "iu").test(text);
}

function hasEntityDetailPhrase(text: string, entity: SemanticEntity): boolean {
  return new RegExp(`${buildEntityPattern(entity)}\\s*(?:详情|明细|概览|总览|信息|情况)`, "iu").test(text);
}

function matchesRelation(text: string, parent: ContextEntityName, entity: SemanticEntity): boolean {
  const referenceSource = buildAlternation(CONTEXT_REFERENCE_WORDS);
  const relationSource = buildAlternation(RELATION_WORDS);
  const listSource = buildAlternation(LIST_WORDS);
  const parentPattern = buildEntityPattern(parent);
  const entityPattern = buildEntityPattern(entity);
  const patterns = [
    new RegExp(`(?:${referenceSource})?\\s*${parentPattern}\\s*(?:${relationSource})\\s*(?:的)?\\s*${entityPattern}`, "iu"),
    new RegExp(`(?:${referenceSource})?\\s*${parentPattern}\\s*(?:${relationSource})\\s*(?:${listSource})?\\s*${entityPattern}`, "iu"),
    new RegExp(`(?:${referenceSource})?\\s*${parentPattern}\\s*(?:${listSource})\\s*${entityPattern}`, "iu"),
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function detectRequestedAction(text: string): SemanticAction | null {
  const normalized = compactText(text);
  if (!normalized) {
    return null;
  }
  if (containsListSignal(normalized)) {
    return "list";
  }
  if (containsDetailSignal(normalized) || containsReferenceWord(normalized)) {
    return "detail";
  }
  return null;
}

function getContextEntities(userid: string): ContextEntityName[] {
  const context = loadWecomSessionContext(userid);
  if (!context) {
    return [];
  }

  return CONTEXT_PRIORITY.filter((entity) => Boolean(context.entities[entity]));
}

function resolveContextualListIntent(text: string, userid: string, routes: IntentRoute[]): SemanticRouteResolution | null {
  for (const rule of SEMANTIC_INTENT_RULES) {
    if (rule.action !== "list" || !rule.parent) {
      continue;
    }
    if (!hasEntityMention(text, rule.entity)) {
      continue;
    }
    if (!matchesRelation(text, rule.parent, rule.entity)) {
      continue;
    }

    const route = findRouteByIntent(rule.intent, routes);
    if (route) {
      return {
        match: { route, trigger: `semantic:${rule.intent}` },
        reason: `explicit-${rule.parent}-${rule.entity}`,
      };
    }
  }

  if (!containsListSignal(compactText(text))) {
    return null;
  }

  const contextEntities = getContextEntities(userid);
  for (const parent of contextEntities) {
    for (const rule of SEMANTIC_INTENT_RULES) {
      if (rule.action !== "list" || rule.parent !== parent) {
        continue;
      }
      if (!hasEntityMention(text, rule.entity)) {
        continue;
      }

      const route = findRouteByIntent(rule.intent, routes);
      if (route) {
        return {
          match: { route, trigger: `semantic:${rule.intent}` },
          reason: `context-${rule.parent}-${rule.entity}`,
        };
      }
    }
  }

  return null;
}

function resolveContextualDetailIntent(text: string, userid: string, routes: IntentRoute[]): SemanticRouteResolution | null {
  const directRules = SEMANTIC_INTENT_RULES.filter((rule) => rule.action === "detail");

  for (const rule of directRules) {
    if (!hasReferencedEntity(text, rule.entity) && !hasEntityDetailPhrase(text, rule.entity)) {
      continue;
    }

    const route = findRouteByIntent(rule.intent, routes);
    if (route) {
      return {
        match: { route, trigger: `semantic:${rule.intent}` },
        reason: `explicit-${rule.entity}`,
      };
    }
  }

  if (!containsReferenceWord(compactText(text))) {
    return null;
  }

  const contextEntities = getContextEntities(userid);
  for (const entity of contextEntities) {
    const rule = directRules.find((item) => item.entity === entity);
    if (!rule) {
      continue;
    }

    const route = findRouteByIntent(rule.intent, routes);
    if (route) {
      return {
        match: { route, trigger: `semantic:${rule.intent}` },
        reason: `context-${rule.entity}`,
      };
    }
  }

  return null;
}

export function findContextualSemanticRoute(text: string, userid: string, routes: IntentRoute[]): SemanticRouteResolution | null {
  const normalized = normalizeText(text);
  if (!normalized) {
    return null;
  }

  if (containsCreateIntent(normalized)) {
    return null;
  }

  const action = detectRequestedAction(normalized);
  if (!action) {
    return null;
  }

  if (action === "list") {
    return resolveContextualListIntent(normalized, userid, routes);
  }

  return resolveContextualDetailIntent(normalized, userid, routes);
}
