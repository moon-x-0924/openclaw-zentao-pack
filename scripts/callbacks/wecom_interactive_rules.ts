export type InteractiveEntityType = "task" | "bug" | "story";

export interface InteractiveEntityState {
  entityType: InteractiveEntityType;
  currentStatus?: string;
}

export interface InteractiveValidationInput extends InteractiveEntityState {
  actionKey: string;
  targetStatus?: string;
}

export interface InteractiveValidationResult {
  allowed: boolean;
  reason?: string;
}

function normalizeStatus(value: string | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

function taskActionLabels(): Record<string, string> {
  return {
    start: "开始任务",
    finish: "完成任务",
    block: "阻塞任务",
  };
}

function bugActionLabels(): Record<string, string> {
  return {
    activate: "激活Bug",
    resolve: "解决Bug",
    close: "关闭Bug",
  };
}

export function getTaskAllowedActions(status: string | undefined): string[] {
  switch (normalizeStatus(status)) {
    case "wait":
    case "pause":
      return ["start"];
    case "doing":
      return ["finish", "block"];
    default:
      return [];
  }
}

export function getTaskAllowedTargetStatuses(status: string | undefined): string[] {
  switch (normalizeStatus(status)) {
    case "wait":
    case "pause":
      return ["doing"];
    case "doing":
      return ["done", "pause"];
    default:
      return [];
  }
}

export function getBugAllowedActions(status: string | undefined): string[] {
  switch (normalizeStatus(status)) {
    case "active":
      return ["resolve", "close"];
    case "resolved":
      return ["activate", "close"];
    case "closed":
      return ["activate"];
    default:
      return [];
  }
}

export function getBugAllowedTargetStatuses(status: string | undefined): string[] {
  switch (normalizeStatus(status)) {
    case "active":
      return ["resolve", "close"];
    case "resolved":
      return ["activate", "close"];
    case "closed":
      return ["activate"];
    default:
      return [];
  }
}

export function canReviewStoryStatus(status: string | undefined): boolean {
  return normalizeStatus(status) !== "closed";
}

function buildIllegalActionReason(entityType: InteractiveEntityType, action: string, currentStatus: string | undefined): string {
  const labels = entityType === "task" ? taskActionLabels() : bugActionLabels();
  const actionLabel = labels[action] ?? action;
  const statusLabel = normalizeStatus(currentStatus) || "unknown";
  return `当前状态为 ${statusLabel}，不允许执行“${actionLabel}”。请刷新卡片后重试。`;
}

export function validateInteractiveAction(input: InteractiveValidationInput): InteractiveValidationResult {
  const currentStatus = normalizeStatus(input.currentStatus);

  switch (input.actionKey) {
    case "task.status.start":
      return getTaskAllowedActions(currentStatus).includes("start")
        ? { allowed: true }
        : { allowed: false, reason: buildIllegalActionReason("task", "start", currentStatus) };
    case "task.status.finish":
      return getTaskAllowedActions(currentStatus).includes("finish")
        ? { allowed: true }
        : { allowed: false, reason: buildIllegalActionReason("task", "finish", currentStatus) };
    case "task.status.block":
      return getTaskAllowedActions(currentStatus).includes("block")
        ? { allowed: true }
        : { allowed: false, reason: buildIllegalActionReason("task", "block", currentStatus) };
    case "task.status.submit":
      return getTaskAllowedTargetStatuses(currentStatus).includes(normalizeStatus(input.targetStatus))
        ? { allowed: true }
        : { allowed: false, reason: `当前状态为 ${currentStatus || "unknown"}，不允许更新为“${input.targetStatus ?? "unknown"}”。请刷新卡片后重试。` };
    case "bug.status.activate":
      return getBugAllowedActions(currentStatus).includes("activate")
        ? { allowed: true }
        : { allowed: false, reason: buildIllegalActionReason("bug", "activate", currentStatus) };
    case "bug.status.resolve":
      return getBugAllowedActions(currentStatus).includes("resolve")
        ? { allowed: true }
        : { allowed: false, reason: buildIllegalActionReason("bug", "resolve", currentStatus) };
    case "bug.status.close":
      return getBugAllowedActions(currentStatus).includes("close")
        ? { allowed: true }
        : { allowed: false, reason: buildIllegalActionReason("bug", "close", currentStatus) };
    case "bug.status.submit":
      return getBugAllowedTargetStatuses(currentStatus).includes(normalizeStatus(input.targetStatus))
        ? { allowed: true }
        : { allowed: false, reason: `当前状态为 ${currentStatus || "unknown"}，不允许更新为“${input.targetStatus ?? "unknown"}”。请刷新卡片后重试。` };
    case "story.review.submit":
      return canReviewStoryStatus(currentStatus)
        ? { allowed: true }
        : { allowed: false, reason: `当前需求状态为 ${currentStatus || "unknown"}，不允许继续评审。请刷新卡片后重试。` };
    default:
      return { allowed: true };
  }
}
