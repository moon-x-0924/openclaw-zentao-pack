import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const DEFAULT_SOP_LOG_RELATIVE_PATH = "docs/ops/sop问题记录/测试问题SOP清单.md";
const SHANGHAI_TIME_ZONE = "Asia/Shanghai";
const RECORD_MARKER = "## 问题记录";

export interface SopTestIssueEntryInput {
  title: string;
  source: "auto" | "manual";
  category?: string;
  command?: string;
  cwd?: string;
  expected?: string;
  actual?: string;
  analysis?: string;
  nextAction?: string;
  owner?: string;
  tags?: string[];
  stdout?: string;
  stderr?: string;
  note?: string;
  screenshots?: string[];
  imageNotes?: string[];
  exitCode?: number | null;
  signal?: NodeJS.Signals | null;
}

interface ScreenshotLink {
  label: string;
  markdownPath: string;
}

function findRepoRoot(startDir: string): string {
  let current = path.resolve(startDir);
  while (true) {
    if (existsSync(path.join(current, "package.json")) && existsSync(path.join(current, "scripts"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
}

function formatShanghaiNow(): string {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const lookup = new Map(parts.map((part) => [part.type, part.value]));
  return `${lookup.get("year")}-${lookup.get("month")}-${lookup.get("day")} ${lookup.get("hour")}:${lookup.get("minute")} CST`;
}

function ensureTrailingNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}

function normalizeMultiline(text: string | undefined, fallback: string): string {
  const normalized = text?.trim();
  return normalized ? normalized : fallback;
}

function truncateText(text: string | undefined, maxLines: number, maxChars: number): string | null {
  if (!text) {
    return null;
  }

  const normalized = text.trim();
  if (!normalized) {
    return null;
  }

  const lines = normalized.split(/\r?\n/);
  const limitedLines = lines.slice(0, maxLines);
  let truncated = limitedLines.join("\n");

  if (truncated.length > maxChars) {
    truncated = `${truncated.slice(0, maxChars)}\n...<已截断>`;
  } else if (lines.length > maxLines) {
    truncated = `${truncated}\n...<已截断，共 ${lines.length} 行>`;
  }

  return truncated;
}

function formatCodeFence(text: string): string {
  return text.replace(/```/g, "'''");
}

function normalizeMarkdownPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function normalizeEvidenceNotes(notes: string[] | undefined): string[] {
  return (notes ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseScreenshotItem(raw: string, index: number): { label: string; filePath: string } {
  const normalized = raw.trim();
  if (!normalized) {
    return {
      label: `截图${index + 1}`,
      filePath: normalized,
    };
  }

  const separator = normalized.includes("::") ? "::" : normalized.includes("=>") ? "=>" : null;
  if (!separator) {
    return {
      label: `截图${index + 1}`,
      filePath: normalized,
    };
  }

  const [labelPart, ...rest] = normalized.split(separator);
  const filePath = rest.join(separator).trim();
  const label = labelPart.trim() || `截图${index + 1}`;

  return {
    label,
    filePath: filePath || normalized,
  };
}

function resolveScreenshotLinks(
  screenshots: string[] | undefined,
  logFile: string,
  baseDir: string,
): ScreenshotLink[] {
  return (screenshots ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const parsed = parseScreenshotItem(item, index);
      const absolutePath = path.isAbsolute(parsed.filePath) ? parsed.filePath : path.resolve(baseDir, parsed.filePath);
      const relativePath = path.relative(path.dirname(logFile), absolutePath);
      const normalizedPath = normalizeMarkdownPath(relativePath || path.basename(absolutePath));
      const markdownPath = normalizedPath.startsWith(".") || normalizedPath.startsWith("..")
        ? normalizedPath
        : `./${normalizedPath}`;

      return {
        label: parsed.label,
        markdownPath,
      };
    });
}

function buildImageNoteLabel(index: number, screenshotLinks: ScreenshotLink[]): string {
  const screenshotLabel = screenshotLinks[index]?.label?.trim();
  if (!screenshotLabel || screenshotLabel === `截图${index + 1}`) {
    return `图${index + 1}`;
  }
  return `图${index + 1}（${screenshotLabel}）`;
}

function buildInitialDocument(): string {
  return `# 测试问题 SOP 清单

这个文件用于在本地记录测试、联调、回归过程中发现的问题，便于后续追踪、复盘和回填禅道。

相关目录：

- \`docs/ops/sop问题记录/测试问题SOP清单.md\`
- \`docs/ops/sop问题记录/SOP问题记录提示词.md\`
- \`docs/ops/sop问题记录/screenshots/\`

## 使用规则

- 用户已经明确描述现场问题时，先记录问题，不默认要求代理重新执行或复现。
- 命令执行失败时，可以使用自动记录命令，让失败信息直接追加到本文件。
- 命令执行成功但结果不符合预期，或问题发生在真实使用场景中时，使用手工记录命令补记。
- 每条问题至少补齐：现象、期望、实际、初步判断、下一步动作。
- 需要保留现场证据时，可以附截图；建议把截图放到 \`docs/ops/sop问题记录/screenshots/\` 下再记录，并为每张图补一句“这张图是什么”。
- 如果只有聊天里上传的图片、没有本地路径，也要把看图后的“图片说明”写入问题记录。
- 新问题默认追加在“问题记录”顶部，方便先看最新问题。

## 推荐命令

- 截图先归档到标准目录：\`npm run archive-sop-screenshot -- --source ~/Desktop/wecom-module.png --name wecom-module-general-ai\`
- 现场问题直接记录：\`npm run log-test-issue -- --title "企微消息未生成卡片记录" --expected "发送企微消息后自动生成卡片记录" --actual "消息已发送，但系统没有生成卡片记录" --analysis "可能是企微回调未命中卡片落盘链路" --next-action "检查企微回调日志、卡片生成逻辑和落盘条件" --tags "企微,卡片,现场问题"\`
- 带截图记录：\`npm run log-observed-issue -- --title "企微消息未生成卡片记录" --expected "发送企微消息后自动生成卡片记录" --actual "消息已发送，但系统没有生成卡片记录" --analysis "可能是企微回调未命中卡片落盘链路" --next-action "检查企微回调日志、卡片生成逻辑和落盘条件" --screenshots "企微聊天窗口未出现卡片::docs/ops/sop问题记录/screenshots/wecom-card-missing.png,调试台显示走了general_ai::docs/ops/sop问题记录/screenshots/wecom-router-debug.png"\`
- 只有图片说明也可记录：\`npm run log-observed-issue -- --title "企微消息未生成卡片记录" --expected "发送企微消息后自动生成卡片记录" --actual "消息已发送，但系统没有生成卡片记录" --analysis "可能是企微回调未命中卡片落盘链路" --next-action "检查企微回调日志、卡片生成逻辑和落盘条件" --image-notes "图1显示企微会话里返回普通文本，没有卡片|图2显示调试链路命中 general_ai"\`
- 自动记录：\`npm run test-with-sop-log -- --title "联调企微回调失败" --cmd "npm run wecom-callback -- --data-file examples/callbacks/tmp-callback-task.json"\`
- 手工记录：\`npm run log-test-issue -- --title "测试单状态未更新" --actual "接口返回成功但页面仍显示进行中" --command "npm run update-testtask-status -- --testtask 1 --status done"\`

## 提示词与截图使用

- 常用提示词统一放在 \`docs/ops/sop问题记录/SOP问题记录提示词.md\`，这里不再重复维护第二份。
- 如果你发给 Codex 的是“本地图片路径”，优先先归档到 \`docs/ops/sop问题记录/screenshots/\` 再写记录。
- 记录时推荐同时写 \`--screenshots\` 和 \`--image-notes\`，这样 Markdown 预览时能直接看到图片，也能看到每张图说明了什么。
- \`--screenshots\` 推荐格式：\`截图说明::截图路径\`。

## 问题记录
`;
}

function buildEntry(input: SopTestIssueEntryInput, screenshotLinks: ScreenshotLink[]): string {
  const timestamp = formatShanghaiNow();
  const category = input.category?.trim() || "测试异常";
  const expected = normalizeMultiline(input.expected, "命令执行成功，结果符合预期。");
  const actual = normalizeMultiline(input.actual, "待补充。");
  const analysis = normalizeMultiline(input.analysis, "待补充。");
  const nextAction = normalizeMultiline(input.nextAction, "待补充。");
  const owner = input.owner?.trim() || "待分配";
  const tags = (input.tags ?? []).map((item) => item.trim()).filter(Boolean);
  const stdout = truncateText(input.stdout, 80, 4000);
  const stderr = truncateText(input.stderr, 80, 4000);
  const note = truncateText(input.note, 40, 2000);
  const imageNotes = normalizeEvidenceNotes(input.imageNotes);
  const resultSummary = [
    input.exitCode === null || input.exitCode === undefined ? null : `exit_code=${input.exitCode}`,
    input.signal ? `signal=${input.signal}` : null,
  ].filter(Boolean).join(" ");

  const lines = [
    `### ${timestamp} | ${input.title.trim()}`,
    `- 状态：待处理`,
    `- 记录来源：${input.source === "auto" ? "自动记录" : "手工记录"}`,
    `- 分类：${category}`,
    `- 期望结果：${expected}`,
    `- 实际结果：${actual}`,
    `- 初步判断：${analysis}`,
    `- 下一步动作：${nextAction}`,
    `- 跟进人：${owner}`,
    `- 发生目录：\`${input.cwd?.trim() || process.cwd()}\``,
  ];

  if (input.command?.trim()) {
    lines.push(`- 测试命令：\`${input.command.trim()}\``);
  }

  if (resultSummary) {
    lines.push(`- 命令结果：\`${resultSummary}\``);
  }

  if (tags.length > 0) {
    lines.push(`- 标签：${tags.map((item) => `\`${item}\``).join("、")}`);
  }

  if (note) {
    lines.push(`- 补充说明：${note}`);
  }

  if (imageNotes.length > 0) {
    lines.push("");
    lines.push("- 图片说明：");
    for (const [index, imageNote] of imageNotes.entries()) {
      lines.push(`  - ${buildImageNoteLabel(index, screenshotLinks)}：${imageNote}`);
    }
  }

  if (screenshotLinks.length > 0) {
    lines.push("");
    lines.push("- 现场截图：");
    for (const screenshot of screenshotLinks) {
      lines.push(`  - ${screenshot.label}：\`${screenshot.markdownPath}\``);
    }
    lines.push("");
    for (const screenshot of screenshotLinks) {
      lines.push(`![${screenshot.label}](${screenshot.markdownPath})`);
    }
  }

  if (stdout) {
    lines.push("", "- 标准输出摘录：", "```text", formatCodeFence(stdout), "```");
  }

  if (stderr) {
    lines.push("", "- 错误输出摘录：", "```text", formatCodeFence(stderr), "```");
  }

  return `${lines.join("\n")}\n`;
}

function insertEntry(documentText: string, entryText: string): string {
  const markerIndex = documentText.indexOf(RECORD_MARKER);
  if (markerIndex === -1) {
    return `${documentText.trimEnd()}\n\n${RECORD_MARKER}\n\n${entryText.trimEnd()}\n`;
  }

  const markerLineEnd = documentText.indexOf("\n", markerIndex);
  if (markerLineEnd === -1) {
    return `${documentText.trimEnd()}\n\n${entryText.trimEnd()}\n`;
  }

  const prefix = documentText.slice(0, markerLineEnd + 1);
  const suffix = documentText.slice(markerLineEnd + 1).replace(/^\s*/, "");
  return `${prefix}\n${entryText.trimEnd()}\n\n${suffix}`.replace(/\n{3,}/g, "\n\n");
}

export function resolveSopLogFile(customLogFile?: string, baseDir: string = process.cwd()): string {
  if (customLogFile?.trim()) {
    return path.resolve(baseDir, customLogFile.trim());
  }

  const repoRoot = findRepoRoot(baseDir);
  return path.join(repoRoot, DEFAULT_SOP_LOG_RELATIVE_PATH);
}

export function appendSopTestIssue(
  input: SopTestIssueEntryInput,
  options: {
    logFile?: string;
    baseDir?: string;
  } = {},
): { logFile: string; title: string; timestamp: string } {
  const baseDir = options.baseDir ?? process.cwd();
  const logFile = resolveSopLogFile(options.logFile, baseDir);
  const current = existsSync(logFile) ? readFileSync(logFile, "utf8") : buildInitialDocument();
  const screenshotLinks = resolveScreenshotLinks(input.screenshots, logFile, baseDir);
  const entry = buildEntry(input, screenshotLinks);
  const updated = insertEntry(current, entry);

  mkdirSync(path.dirname(logFile), { recursive: true });
  writeFileSync(logFile, ensureTrailingNewline(updated), "utf8");

  return {
    logFile,
    title: input.title.trim(),
    timestamp: formatShanghaiNow(),
  };
}
