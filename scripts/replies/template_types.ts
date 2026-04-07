import type { JsonObject } from "../shared/zentao_client";

export interface ReplyRenderContext {
  intent: string;
  script: string;
  userid: string;
  routeArgs: Record<string, string>;
  result: JsonObject;
}

export interface ReplyTemplate {
  name: string;
  render(context: ReplyRenderContext): string;
}
