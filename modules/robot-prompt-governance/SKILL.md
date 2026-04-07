---
name: robot-prompt-governance
description: 机器人 Prompt 与回复治理模块，用于统一 intent-routing 路由、脚本专属回复模板、fallback 包装和输出一致性规则。
---

# 机器人 Prompt 与回复治理模块

## 目的

提供一层可复用的治理能力，确保禅道工作流机器人在处理企业微信或其他结构化业务请求时：

- 先经过稳定的 `intent-routing.yaml` 路由判断
- 再执行命中的业务脚本
- 优先使用脚本专属回复模板渲染 `reply_text`
- 仅在未配置专属模板时退回通用 fallback 包装
- 始终保证回复内容基于真实脚本 JSON 结果，不编造业务数据

## 范围

- 基于 `intent-routing.yaml` 的稳定意图路由
- 参数校验与缺参最小追问
- 脚本执行结果到 `reply_text` 的模板渲染
- 脚本专属模板与通用 fallback 模板治理
- 成功 / 无结果 / 失败 / 缺参 的统一兜底规则
- `reply_template`、`reply_text_override`、fallback 包装的优先级约束

## 当前治理原则

### 1. 路由优先

- 将 `agents/modules/intent-routing.yaml` 视为稳定禅道意图的首要机器可读路由表。
- 命中路由后，优先执行对应 `script`。
- 路由中的 `reply_template` 用于指定该脚本命中后的首选回复模板。
- 不再维护与路由表平行且容易漂移的自由文本命令清单。

### 2. 脚本模板优先

- 如果命中的路由配置了 `reply_template`，必须优先加载 `scripts/replies/templates/` 下对应的模板文件。
- 模板文件负责把脚本执行返回的 JSON 结果渲染成最终 `reply_text`。
- 任务列表、Bug 列表、详情页、动作执行结果等结构化业务回复，默认应由脚本专属模板决定。
- 不再强制要求所有禅道回复统一使用固定 5 段包装。

### 3. 脚本结果必须真实

- 模板输出必须严格基于脚本执行后返回的 JSON 字段。
- 不得编造禅道对象、状态、用户、字段或执行结果。
- 如果某个字段缺失，应按模板中的降级规则显示，例如使用账号代替角色、使用 userid 代替姓名，或明确提示“未匹配”。

### 4. fallback 兜底

- 如果未配置 `reply_template`，则允许退回通用 fallback 模板。
- 如果脚本显式返回 `reply_text_override=true`，可直接使用脚本返回的 `reply_text`。
- 如果脚本执行失败，应使用失败兜底回复。
- 如果脚本结果为空，应使用无结果兜底回复。
- 如果参数缺失，应使用缺参兜底回复，并只追问最小必要字段。

## 推荐资产

- `agents/modules/intent-routing.yaml`
- `scripts/replies/template_registry.ts`
- `scripts/replies/template_types.ts`
- `scripts/replies/templates/`
- `references/robot-prompt-output-governance.md`
- 相关业务脚本，例如：
  - `scripts/queries/get_my_tasks.ts`
  - `scripts/queries/query_my_bugs.ts`
  - `scripts/actions/update_task_status.ts`

## 推荐目录组织

```text
agents/modules/intent-routing.yaml
scripts/replies/template_types.ts
scripts/replies/template_registry.ts
scripts/replies/templates/
  query-my-tasks.ts
  query-my-bugs.ts
  query-task-detail.ts
  update-task-status.ts
  generic-fallback.ts
