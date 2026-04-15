import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { WecomAttachmentInfo } from "./wecom_payload";

const STORE_DIR = path.resolve(__dirname, "../../tmp/wecom-recent-message-window");
const WINDOW_MS = 60 * 1000;

export interface WecomRecentMessageRecord {
  id: string;
  userid: string;
  receivedAt: number;
  type: "text" | "file";
  text?: string;
  attachment?: WecomAttachmentInfo;
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

function readRecords(userid: string): WecomRecentMessageRecord[] {
  ensureStoreDir();
  const storeFile = getStoreFile(userid);
  if (!existsSync(storeFile)) {
    return [];
  }

  try {
    const parsed = JSON.parse(readFileSync(storeFile, "utf8")) as WecomRecentMessageRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecords(userid: string, records: WecomRecentMessageRecord[]): void {
  ensureStoreDir();
  writeFileSync(getStoreFile(userid), JSON.stringify(records, null, 2), "utf8");
}

function pruneRecords(records: WecomRecentMessageRecord[], now = Date.now()): WecomRecentMessageRecord[] {
  return records.filter((record) => now - record.receivedAt <= WINDOW_MS);
}

export function appendRecentWecomMessage(input: {
  userid: string;
  type: "text" | "file";
  text?: string;
  attachment?: WecomAttachmentInfo;
}): WecomRecentMessageRecord[] {
  const userid = input.userid.trim();
  if (!userid) {
    return [];
  }

  const now = Date.now();
  const records = pruneRecords(readRecords(userid), now);
  records.push({
    id: randomUUID(),
    userid,
    receivedAt: now,
    type: input.type,
    text: input.text,
    attachment: input.attachment,
  });
  saveRecords(userid, records);
  return records;
}

export function listRecentWecomMessages(userid: string): WecomRecentMessageRecord[] {
  const normalizedUserid = userid.trim();
  if (!normalizedUserid) {
    return [];
  }

  const records = pruneRecords(readRecords(normalizedUserid));
  saveRecords(normalizedUserid, records);
  return records;
}
