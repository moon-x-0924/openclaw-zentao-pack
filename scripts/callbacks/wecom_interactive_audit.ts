import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { JsonObject } from "../shared/zentao_client";

const AUDIT_DIR = path.resolve(__dirname, "../../tmp/interactive-audit");
const AUDIT_FILE = path.join(AUDIT_DIR, "interactive-audit.jsonl");

export interface InteractiveAuditRecord extends JsonObject {
  userid: string;
  task_id: string;
  action_key: string;
  operation_id: string;
  status: "received" | "completed" | "failed" | "skipped";
  route_script?: string;
  message?: string;
  payload?: JsonObject;
  created_at?: string;
}

function ensureAuditDir(): void {
  if (!existsSync(AUDIT_DIR)) {
    mkdirSync(AUDIT_DIR, { recursive: true });
  }
}

export function appendInteractiveAudit(record: InteractiveAuditRecord): void {
  ensureAuditDir();
  appendFileSync(
    AUDIT_FILE,
    `${JSON.stringify({
      ...record,
      created_at: record.created_at ?? new Date().toISOString(),
    })}\n`,
    "utf8",
  );
}
