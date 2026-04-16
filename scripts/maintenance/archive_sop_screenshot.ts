import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { printJson } from "../shared/zentao_client";

const DEFAULT_SCREENSHOT_DIR = path.join("docs", "ops", "sop问题记录", "screenshots");
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

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

function formatDateDir(date: Date): string {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const lookup = new Map(parts.map((part) => [part.type, part.value]));
  return `${lookup.get("year")}-${lookup.get("month")}-${lookup.get("day")}`;
}

function slugifyFileName(input: string): string {
  const normalized = input
    .trim()
    .replace(/\.[^.]+$/u, "")
    .replace(/[\s/\\]+/g, "-")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "screenshot";
}

function pickAvailableTarget(filePath: string): string {
  if (!existsSync(filePath)) {
    return filePath;
  }

  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${base}-${index}${ext}`;
    if (!existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not allocate target file name for ${filePath}`);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      source: { type: "string" },
      name: { type: "string" },
      cwd: { type: "string", default: process.cwd() },
      "base-dir": { type: "string" },
      "date-dir": { type: "string" },
    },
    allowPositionals: false,
  });

  if (!values.source?.trim()) {
    throw new Error("Missing required option --source");
  }

  const cwd = path.resolve(values.cwd);
  const repoRoot = findRepoRoot(cwd);
  const sourcePath = path.resolve(cwd, values.source.trim());
  if (!existsSync(sourcePath)) {
    throw new Error(`Source file does not exist: ${sourcePath}`);
  }

  const ext = path.extname(sourcePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported screenshot extension '${ext}'. Supported: ${Array.from(SUPPORTED_EXTENSIONS).join(", ")}`,
    );
  }

  const baseDir = path.resolve(repoRoot, values["base-dir"]?.trim() || DEFAULT_SCREENSHOT_DIR);
  const dateDir = values["date-dir"]?.trim() || formatDateDir(new Date());
  const fileNameBase = slugifyFileName(values.name?.trim() || path.basename(sourcePath, ext));
  const targetDir = path.join(baseDir, dateDir);
  mkdirSync(targetDir, { recursive: true });

  const targetPath = pickAvailableTarget(path.join(targetDir, `${fileNameBase}${ext}`));
  copyFileSync(sourcePath, targetPath);

  const relativePath = path.relative(repoRoot, targetPath).replace(/\\/g, "/");
  const screenshotArg = `--screenshots "请补图片说明::${relativePath}"`;
  const imageNotesArg = `--image-notes "图1：请补充这张图说明了什么，以及它支持了什么判断"`;

  printJson({
    ok: true,
    sourcePath,
    targetPath,
    relativePath,
    screenshotArg,
    imageNotesArg,
    promptSnippet:
      `请基于我刚才发的图片和问题描述，直接整理一条完整的问题记录，并写入 docs/ops/sop问题记录/测试问题SOP清单.md。` +
      `记录时请同时使用 ${screenshotArg} 和 ${imageNotesArg}。`,
  });
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
