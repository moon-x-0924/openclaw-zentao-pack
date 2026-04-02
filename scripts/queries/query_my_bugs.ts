import { parseArgs } from "node:util";
import { printJson, type JsonObject, ZentaoClient } from "../shared/zentao_client";
import { summarizeList } from "./_query_utils";

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      userid: { type: "string" },
    },
    allowPositionals: false,
  });
  const client = new ZentaoClient({ userid: values.userid });
  const result = await client.getMyBugs();
  const items = result.bugs as JsonObject[];

  printJson({
    ok: true,
    type: "my-bugs",
    userid: values.userid ?? client.userid ?? null,
    matched_user: result.matchedUser,
    identifiers: result.identifiers,
    title: result.title,
    count: items.length,
    todo_count: result.todoCount,
    items: summarizeList(items, ["id", "title", "status", "severity", "pri", "assignedTo", "openedBy", "resolvedBy", "closedBy"]),
  });
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}
`);
  process.exit(1);
});
