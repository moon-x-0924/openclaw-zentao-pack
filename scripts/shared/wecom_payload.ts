import { type JsonObject, type JsonValue } from "./zentao_client";

export interface WecomMessagePayload extends JsonObject {
  userid?: string;
  userId?: string;
  FromUserName?: string;
  fromUser?: string;
  from_user?: string;
  content?: string;
  text?: string;
  body?: JsonValue;
  sender?: JsonValue;
  session?: JsonValue;
}

function getNestedString(record: JsonObject | undefined, keys: string[]): string | undefined {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function toObject(value: JsonValue | undefined): JsonObject | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }
  return undefined;
}

export function parseJsonInput(raw: string, source: string): WecomMessagePayload {
  try {
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, "")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("payload must be a JSON object");
    }
    return parsed as WecomMessagePayload;
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${source}: ${(error as Error).message}`);
  }
}

export function extractUserid(payload: WecomMessagePayload): string | undefined {
  return (
    getNestedString(payload, ["userid", "userId", "FromUserName", "fromUser", "from_user"]) ??
    getNestedString(toObject(payload.sender), ["userid", "userId", "from_user_id", "id"]) ??
    getNestedString(toObject(payload.session), ["userid", "userId", "fromUser"])
  );
}

export function extractText(payload: WecomMessagePayload): string {
  return (
    getNestedString(payload, ["content", "text"]) ??
    getNestedString(toObject(payload.body), ["content", "text"]) ??
    getNestedString(toObject(payload.sender), ["content"]) ??
    ""
  );
}
