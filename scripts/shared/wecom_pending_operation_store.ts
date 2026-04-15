import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { WecomAttachmentInfo } from "./wecom_payload";

const STORE_DIR = path.resolve(__dirname, "../../tmp/wecom-pending-operations");
const EXPIRY_MS = 3 * 60 * 1000;

export interface WecomPendingOperation {
  id: string;
  userid: string;
  intent: "requirement-to-testcase" | "import-tasks-from-excel";
  originalText: string;
  attachments: WecomAttachmentInfo[];
  createdAt: number;
  status: "awaiting_confirmation" | "awaiting_selection";
}

function ensureStoreDir(): void {
  if (!existsSync(STORE_DIR)) {
    mkdirSync(STORE_DIR, { recursive: true });
  }
}

function sanitizeUserid(userid: string): string {
  return userid.replace(/[^A-Za-z0-9._-]+/g, "_");
}

function getStoreFile(userid: string): string {
  return path.join(STORE_DIR, `${sanitizeUserid(userid)}.json`);
}

function isExpired(operation: WecomPendingOperation, now = Date.now()): boolean {
  return now - operation.createdAt > EXPIRY_MS;
}

export function savePendingWecomOperation(input: Omit<WecomPendingOperation, "id" | "createdAt">): WecomPendingOperation {
  ensureStoreDir();
  const record: WecomPendingOperation = {
    id: randomUUID(),
    createdAt: Date.now(),
    ...input,
  };
  writeFileSync(getStoreFile(input.userid), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export function loadPendingWecomOperation(userid: string): WecomPendingOperation | null {
  ensureStoreDir();
  const storeFile = getStoreFile(userid.trim());
  if (!existsSync(storeFile)) {
    return null;
  }

  try {
    const parsed = JSON.parse(readFileSync(storeFile, "utf8")) as WecomPendingOperation;
    if (!parsed || typeof parsed !== "object" || isExpired(parsed)) {
      rmSync(storeFile, { force: true });
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingWecomOperation(userid: string): void {
  rmSync(getStoreFile(userid.trim()), { force: true });
}
