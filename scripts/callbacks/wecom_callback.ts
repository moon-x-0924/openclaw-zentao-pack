import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { printJson, type JsonObject, type JsonValue } from "../shared/zentao_client";
import { handleContactSyncPayload, isContactSyncPayload } from "./wecom_contact_sync";
import { extractText, extractUserid, parseJsonInput } from "../shared/wecom_payload";
import { classifyWecomIntentWithLlm, type LlmIntentDecision } from "./llm_intent_router";
import { buildMissingArgsReply, buildRouteHelpText, buildScriptErrorReply, buildScriptResultReply } from "./wecom_reply_formatter";
import { collectMissingArgs, extractRouteArgs, findRouteByIntent, findRouteMatch, loadIntentRoutes, normalizeRouteArgs, type IntentRoute, type RouteMatch } from "./wecom_route_resolver";

interface CallbackPayload extends JsonObject {
  content?: string;
  text?: string;
  msgtype?: string;
  MsgType?: string;
  body?: JsonValue;
}

const PACKAGE_ROOT = path.resolve(__dirname, "../../..");

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
      ? buildScriptErrorReply(route, scriptResult)
      : buildScriptResultReply(route, scriptResult, userid, args),
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
