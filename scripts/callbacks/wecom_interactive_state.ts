import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { JsonObject } from "../shared/zentao_client";

interface InteractiveStateStore extends JsonObject {
  handled?: Record<string, string>;
}

const STATE_DIR = path.resolve(__dirname, "../../tmp/interactive-state");
const STATE_FILE = path.join(STATE_DIR, "handled.json");

function ensureStateDir(): void {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
}

function loadState(): InteractiveStateStore {
  ensureStateDir();
  if (!existsSync(STATE_FILE)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, "utf8")) as InteractiveStateStore;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveState(state: InteractiveStateStore): void {
  ensureStateDir();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

export function hasHandledInteractiveOperation(operationId: string): boolean {
  const state = loadState();
  return typeof state.handled?.[operationId] === "string";
}

export function markInteractiveOperationHandled(operationId: string): void {
  const state = loadState();
  saveState({
    ...state,
    handled: {
      ...(state.handled ?? {}),
      [operationId]: new Date().toISOString(),
    },
  });
}
