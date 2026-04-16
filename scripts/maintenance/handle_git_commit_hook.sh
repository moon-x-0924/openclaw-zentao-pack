#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "${ROOT//[[:space:]]/}" ]] || exit 0

should_enable_hook() {
  [[ "${OPENCLAW_GIT_COMMIT_HOOK_DISABLE:-0}" == "1" ]] && return 1
  [[ "${OPENCLAW_GIT_COMMIT_HOOK_FORCE:-0}" == "1" ]] && return 0
  [[ "$ROOT" == "/root/.openclaw/workspace/skills/openclaw-zentao-pack" ]]
}

should_auto_push() {
  if [[ "${OPENCLAW_GIT_COMMIT_HOOK_PUSH:-}" == "1" ]]; then
    return 0
  fi
  if [[ "${OPENCLAW_GIT_COMMIT_HOOK_PUSH:-}" == "0" ]]; then
    return 1
  fi
  [[ "$ROOT" == "/root/.openclaw/workspace/skills/openclaw-zentao-pack" ]]
}

main() {
  should_enable_hook || exit 0

  cd "$ROOT"

  local commit_hash log_path record_output record_status branch push_output
  commit_hash="$(git rev-parse -q --verify HEAD 2>/dev/null || true)"
  [[ -n "${commit_hash//[[:space:]]/}" ]] || exit 0

  log_path="docs/overview/服务器变更日志.md"

  set +e
  record_output="$(python3 "$ROOT/scripts/maintenance/record_server_change_after_commit.py" "$commit_hash" 2>&1)"
  record_status=$?
  set -e

  if [[ -n "${record_output//[[:space:]]/}" ]]; then
    printf '[git-commit-hook] %s\n' "$record_output"
  fi

  if [[ "$record_status" -ne 0 ]]; then
    exit 0
  fi

  git add "$log_path" >/dev/null 2>&1 || true
  if [[ -z "$(git diff --cached --name-only -- "$log_path")" ]]; then
    exit 0
  fi

  git commit -m "维护: 补记服务器变更日志 ${commit_hash:0:7}" >/dev/null 2>&1 || exit 0

  if ! should_auto_push; then
    printf '[git-commit-hook] log committed locally: %s\n' "${commit_hash:0:7}"
    exit 0
  fi

  branch="$(git branch --show-current 2>/dev/null || true)"
  [[ -n "${branch//[[:space:]]/}" ]] || exit 0
  git config --get remote.origin.url >/dev/null 2>&1 || exit 0

  set +e
  push_output="$(git push origin "HEAD:refs/heads/$branch" 2>&1)"
  set -e
  if [[ -n "${push_output//[[:space:]]/}" ]]; then
    printf '[git-commit-hook] %s\n' "$push_output"
  fi
}

main "$@"
