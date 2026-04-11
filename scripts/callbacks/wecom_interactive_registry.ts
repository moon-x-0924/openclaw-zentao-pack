import { createHash } from "node:crypto";

export interface WecomInteractiveActionDefinition {
  key: string;
  kind: "button" | "form" | "vote";
  description: string;
  routeScript?: string;
  requiredPayload?: string[];
}

const ACTION_PREFIX = "openclaw";

export const WECOM_INTERACTIVE_ACTIONS = {
  taskOpenDetail: "task.detail.open",
  taskRefreshMine: "task.mine.refresh",
  taskQueryMyBugs: "task.mine.query-bugs",
  taskStart: "task.status.start",
  taskFinish: "task.status.finish",
  taskBlock: "task.status.block",
  taskStatusSubmit: "task.status.submit",
  bugOpenDetail: "bug.detail.open",
  bugActivate: "bug.status.activate",
  bugResolve: "bug.status.resolve",
  bugClose: "bug.status.close",
  bugStatusSubmit: "bug.status.submit",
  storyReviewSubmit: "story.review.submit",
} as const;

export const INTERACTIVE_ACTION_DEFINITIONS: Record<string, WecomInteractiveActionDefinition> = {
  [WECOM_INTERACTIVE_ACTIONS.taskOpenDetail]: {
    key: WECOM_INTERACTIVE_ACTIONS.taskOpenDetail,
    kind: "button",
    description: "Open a task detail card from a list or summary card.",
    routeScript: "query-task-detail",
    requiredPayload: ["task"],
  },
  [WECOM_INTERACTIVE_ACTIONS.taskRefreshMine]: {
    key: WECOM_INTERACTIVE_ACTIONS.taskRefreshMine,
    kind: "button",
    description: "Refresh the current user's task list.",
    routeScript: "query-my-tasks",
  },
  [WECOM_INTERACTIVE_ACTIONS.taskQueryMyBugs]: {
    key: WECOM_INTERACTIVE_ACTIONS.taskQueryMyBugs,
    kind: "button",
    description: "Open the current user's bug list.",
    routeScript: "query-my-bugs",
  },
  [WECOM_INTERACTIVE_ACTIONS.taskStart]: {
    key: WECOM_INTERACTIVE_ACTIONS.taskStart,
    kind: "button",
    description: "Move a task into an active state.",
    routeScript: "update-task-status",
    requiredPayload: ["task", "status"],
  },
  [WECOM_INTERACTIVE_ACTIONS.taskFinish]: {
    key: WECOM_INTERACTIVE_ACTIONS.taskFinish,
    kind: "button",
    description: "Complete a task from the task detail card.",
    routeScript: "update-task-status",
    requiredPayload: ["task", "status"],
  },
  [WECOM_INTERACTIVE_ACTIONS.taskBlock]: {
    key: WECOM_INTERACTIVE_ACTIONS.taskBlock,
    kind: "button",
    description: "Block a task from the task detail card.",
    routeScript: "update-task-status",
    requiredPayload: ["task", "status"],
  },
  [WECOM_INTERACTIVE_ACTIONS.taskStatusSubmit]: {
    key: WECOM_INTERACTIVE_ACTIONS.taskStatusSubmit,
    kind: "form",
    description: "Submit a task status change form.",
    routeScript: "update-task-status",
    requiredPayload: ["task"],
  },
  [WECOM_INTERACTIVE_ACTIONS.bugOpenDetail]: {
    key: WECOM_INTERACTIVE_ACTIONS.bugOpenDetail,
    kind: "button",
    description: "Open a bug detail card from a list or summary card.",
    routeScript: "query-bug-detail",
    requiredPayload: ["bug"],
  },
  [WECOM_INTERACTIVE_ACTIONS.bugActivate]: {
    key: WECOM_INTERACTIVE_ACTIONS.bugActivate,
    kind: "button",
    description: "Activate a bug from the bug detail card.",
    routeScript: "update-bug-status",
    requiredPayload: ["bug", "status"],
  },
  [WECOM_INTERACTIVE_ACTIONS.bugResolve]: {
    key: WECOM_INTERACTIVE_ACTIONS.bugResolve,
    kind: "button",
    description: "Resolve a bug from the bug detail card.",
    routeScript: "update-bug-status",
    requiredPayload: ["bug", "status"],
  },
  [WECOM_INTERACTIVE_ACTIONS.bugClose]: {
    key: WECOM_INTERACTIVE_ACTIONS.bugClose,
    kind: "button",
    description: "Close a bug from the bug detail card.",
    routeScript: "update-bug-status",
    requiredPayload: ["bug", "status"],
  },
  [WECOM_INTERACTIVE_ACTIONS.bugStatusSubmit]: {
    key: WECOM_INTERACTIVE_ACTIONS.bugStatusSubmit,
    kind: "form",
    description: "Submit a bug status change form.",
    routeScript: "update-bug-status",
    requiredPayload: ["bug"],
  },
  [WECOM_INTERACTIVE_ACTIONS.storyReviewSubmit]: {
    key: WECOM_INTERACTIVE_ACTIONS.storyReviewSubmit,
    kind: "vote",
    description: "Submit a story review vote.",
    routeScript: "review-story",
    requiredPayload: ["story"],
  },
};

export interface ParsedInteractiveActionKey {
  actionKey: string;
  payload: Record<string, string>;
}

export function buildInteractiveActionKey(
  actionKey: string,
  payload: Record<string, string> = {},
): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(payload).sort()) {
    const value = payload[key];
    if (value.trim()) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `${ACTION_PREFIX}:${actionKey}?${query}` : `${ACTION_PREFIX}:${actionKey}`;
}

export function parseInteractiveActionKey(raw: string): ParsedInteractiveActionKey | null {
  if (!raw.startsWith(`${ACTION_PREFIX}:`)) {
    return null;
  }

  const body = raw.slice(ACTION_PREFIX.length + 1);
  const [actionKey, query = ""] = body.split("?", 2);
  if (!actionKey) {
    return null;
  }

  const payload: Record<string, string> = {};
  const params = new URLSearchParams(query);
  for (const [key, value] of params.entries()) {
    payload[key] = value;
  }

  return { actionKey, payload };
}

export function getInteractiveActionDefinition(actionKey: string): WecomInteractiveActionDefinition | undefined {
  return INTERACTIVE_ACTION_DEFINITIONS[actionKey];
}

export function createInteractiveOperationId(input: {
  userid: string;
  taskId: string;
  actionKey: string;
  payload?: Record<string, string>;
}): string {
  const hash = createHash("sha1");
  hash.update(input.userid);
  hash.update("|");
  hash.update(input.taskId);
  hash.update("|");
  hash.update(input.actionKey);
  hash.update("|");
  hash.update(JSON.stringify(input.payload ?? {}));
  return hash.digest("hex");
}
