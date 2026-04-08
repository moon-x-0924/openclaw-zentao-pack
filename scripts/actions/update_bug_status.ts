import { parseArgs } from "node:util";
import { printJson, type JsonObject, ZentaoClient } from "../shared/zentao_client";

const ALLOWED_STATUSES = new Set(["resolve", "close", "activate"]);

function requiredString(value: string | undefined, optionName: string): string {
  if (!value) {
    throw new Error(`Missing required option --${optionName}`);
  }
  return value;
}

function requiredNumber(value: string | undefined, optionName: string): number {
  const parsed = Number(requiredString(value, optionName));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Option --${optionName} must be a valid positive number`);
  }
  return parsed;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      bug: { type: "string" },
      "bug-id": { type: "string" },
      userid: { type: "string" },
      status: { type: "string" },
      comment: { type: "string", default: "" },
      resolution: { type: "string" },
      "assigned-to": { type: "string" },
      "resolved-build": { type: "string" },
      "opened-build": { type: "string" },
      "duplicate-bug": { type: "string" },
    },
    allowPositionals: false,
  });

  const status = requiredString(values.status, "status");
  if (!ALLOWED_STATUSES.has(status)) {
    throw new Error(`Unsupported status '${status}'. Allowed values: ${Array.from(ALLOWED_STATUSES).sort().join(", ")}`);
  }

  if (status === "resolve" && values.resolution === undefined) {
    throw new Error("Status 'resolve' requires --resolution.");
  }

  const payload: JsonObject = { status };
  if (values.comment) payload.comment = values.comment;
  if (values.resolution) payload.resolution = values.resolution;
  if (values["assigned-to"]) payload.assignedTo = values["assigned-to"];
  if (values["resolved-build"]) payload.resolvedBuild = values["resolved-build"];
  if (values["opened-build"]) payload.openedBuild = values["opened-build"];
  if (values["duplicate-bug"]) payload.duplicateBug = values["duplicate-bug"];

  const bugIdRaw = values.bug ?? values["bug-id"];

  const client = new ZentaoClient({ userid: values.userid });
  await client.login(false);
  const result = await client.updateBugStatus(requiredNumber(bugIdRaw, values.bug ? "bug" : "bug-id"), payload);
  printJson({
    ok: true,
    action: "update-bug-status",
    bug: requiredNumber(bugIdRaw, values.bug ? "bug" : "bug-id"),
    status,
    resolution: payload.resolution ?? null,
    assigned_to: payload.assignedTo ?? null,
    message: result.message ?? result.msg ?? "Bug 状态已更新",
    raw: result,
  });
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}
`);
  process.exit(1);
});
