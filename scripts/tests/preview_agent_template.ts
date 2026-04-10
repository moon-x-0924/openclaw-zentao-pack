import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { resolveAgentReplyTemplate } from "../replies/agent_template_registry";
import { loadAgentTemplateNamesFromIntentRouting, validateAgentReplyPayload } from "../replies/agent_templates/_helpers";
import { printJson, type JsonObject } from "../shared/zentao_client";

function parseJsonText(raw: string, source: string): JsonObject {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("expected JSON object");
    }
    return parsed as JsonObject;
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${source}: ${(error as Error).message}`);
  }
}

function parseRouteArgs(raw: string | undefined): Record<string, string> {
  if (!raw) {
    return {};
  }

  const parsed = parseJsonText(raw, "--route-args");
  return Object.fromEntries(
    Object.entries(parsed)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, String(value)]),
  );
}

interface PreviewSuccess {
  template: string;
  inputFile: string;
  payload: JsonObject;
}

function renderTemplatePreview(
  templateName: string,
  inputFile: string,
  values: {
    userid?: string;
    intent?: string;
    script?: string;
    "route-args"?: string;
  },
): PreviewSuccess {
  const result = parseJsonText(readFileSync(inputFile, "utf8"), inputFile);
  const template = resolveAgentReplyTemplate(templateName);
  const context = {
    intent: values.intent ?? templateName,
    script: values.script ?? templateName,
    userid: values.userid ?? "debug-user",
    sourceType: "agent" as const,
    routeArgs: parseRouteArgs(values["route-args"]),
    result,
  };

  const rendered = template.render(context);
  const validated = validateAgentReplyPayload(rendered);
  const parsedPayload = parseJsonText(validated, "rendered agent payload");

  return {
    template: templateName,
    inputFile,
    payload: parsedPayload,
  };
}

function sampleFileToTemplateName(fileName: string): string {
  return fileName.replace(/\.sample\.json$/i, "");
}

function loadAllSampleFiles(sampleDir: string): string[] {
  return readdirSync(sampleDir)
    .filter((fileName) => fileName.endsWith(".sample.json"))
    .sort();
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      template: { type: "string" },
      "input-file": { type: "string" },
      "sample-dir": { type: "string" },
      userid: { type: "string", default: "debug-user" },
      intent: { type: "string" },
      script: { type: "string" },
      "route-args": { type: "string" },
      list: { type: "boolean", default: false },
      "all-samples": { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  if (values.list) {
    printJson({
      ok: true,
      templates: loadAgentTemplateNamesFromIntentRouting(),
    });
    return;
  }

  if (values["all-samples"]) {
    const sampleDir = path.resolve(values["sample-dir"] ?? "examples/agent-template-preview");
    const sampleFiles = loadAllSampleFiles(sampleDir);
    const results = sampleFiles.map((fileName) => {
      const inputFile = path.join(sampleDir, fileName);
      return renderTemplatePreview(sampleFileToTemplateName(fileName), inputFile, values);
    });

    const routeTemplateNames = new Set(loadAgentTemplateNamesFromIntentRouting());
    const sampleTemplates = new Set(results.map((item) => item.template));
    const missingSamples = Array.from(routeTemplateNames).filter((name) => !sampleTemplates.has(name));

    printJson({
      ok: true,
      validated: true,
      sampleDir,
      checkedCount: results.length,
      missingSamples,
      templates: results.map((item) => ({
        template: item.template,
        inputFile: item.inputFile,
      })),
    });
    return;
  }

  const templateName = values.template;
  const inputFile = values["input-file"];
  if (!templateName) {
    throw new Error("Missing required option --template");
  }
  if (!inputFile) {
    throw new Error("Missing required option --input-file");
  }

  const preview = renderTemplatePreview(templateName, inputFile, values);

  printJson({
    ok: true,
    template: preview.template,
    validated: true,
    payload: preview.payload,
  });
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
