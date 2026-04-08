import { parseArgs } from "node:util";
import { printJson, ZentaoClient, type JsonObject } from '../shared/zentao_client';

const ALLOWED_STATUSES = new Set(["doing", "done", "pause", "closed", "activate"]);

function requiredString(value: string | undefined, optionName: string): string {
  if (!value) {
    throw new Error(`Missing required option --${optionName}`);
  }
  return value;
}

function requiredNumber(value: string | undefined, optionName: string): number {
  const parsed = Number(requiredString(value, optionName));
  if (!Number.isFinite(parsed)) {
    throw new Error(`Option --${optionName} must be a valid number`);
  }
  return parsed;
}

function optionalNumber(value: string | undefined, optionName: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Option --${optionName} must be a valid number`);
  }
  return parsed;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      task: { type: "string" },
      "task-id": { type: "string" },
      userid: { type: "string" },
      status: { type: "string" },
      comment: { type: "string", default: "" },
      "consumed-hours": { type: "string" },
      "left-hours": { type: "string" },
    },
    allowPositionals: false,
  });

  const status = requiredString(values.status, "status");
  if (!ALLOWED_STATUSES.has(status)) {
    throw new Error(`Unsupported status '${status}'. Allowed values: ${Array.from(ALLOWED_STATUSES).sort().join(", ")}`);
  }

  if (status === "done" && values["consumed-hours"] === undefined) {
    throw new Error("Status 'done' requires --consumed-hours for the current finished effort.");
  }

  const payload: JsonObject = { status };
  if (values.comment) {
    payload.comment = values.comment;
  }
  const consumedHours = optionalNumber(values["consumed-hours"], "consumed-hours");
  if (consumedHours !== undefined) {
    payload.consumedHours = consumedHours;
  }
  const leftHours = optionalNumber(values["left-hours"], "left-hours");
  if (leftHours !== undefined) {
    payload.leftHours = leftHours;
  }

  const taskIdRaw = values.task ?? values["task-id"];

  const client = new ZentaoClient({ userid: values.userid });
  await client.login(false);
  const result = await client.updateTaskStatus(requiredNumber(taskIdRaw, values.task ? "task" : "task-id"), payload);
  printJson({
    ok: true,
    action: "update-task-status",
    task: requiredNumber(taskIdRaw, values.task ? "task" : "task-id"),
    status,
    comment: payload.comment ?? "",
    consumed_hours: payload.consumedHours ?? null,
    left_hours: payload.leftHours ?? null,
    message: result.message ?? result.msg ?? "任务状态已更新",
    raw: result,
  });
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
