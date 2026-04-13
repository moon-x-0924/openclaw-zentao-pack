# Button Interaction Callback Test

Source:

- [wecom_interactive_registry.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/callbacks/wecom_interactive_registry.ts)
- [wecom_interactive_dispatcher.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/callbacks/wecom_interactive_dispatcher.ts)
- [intent-routing.yaml](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/agents/modules/intent-routing.yaml)

## Purpose

这份文档给开发联调回调使用，重点核对：

- `event_key` 能否正确解析
- `payload` 是否齐全
- dispatcher 最终是否路由到正确脚本
- 是否需要做状态校验

## Open Action Format

当前按钮点击类动作统一使用：

```text
openclaw:<actionKey>?k1=v1&k2=v2
```

例如：

```text
openclaw:task.detail.open?task=123
openclaw:query-not-used
openclaw:release.list.open?product=2
```

## Callback Cases

| actionKey | sample event_key | minimum payload | expected routeScript | state validation |
| --- | --- | --- | --- | --- |
| `task.detail.open` | `openclaw:task.detail.open?task=123` | `task` | `query-task-detail` | no |
| `task.mine.refresh` | `openclaw:task.mine.refresh` | `-` | `query-my-tasks` | no |
| `task.mine.query-bugs` | `openclaw:task.mine.query-bugs` | `-` | `query-my-bugs` | no |
| `bug.detail.open` | `openclaw:bug.detail.open?bug=101` | `bug` | `query-bug-detail` | no |
| `story.detail.open` | `openclaw:story.detail.open?story=88` | `story` | `query-story-detail` | no |
| `release.detail.open` | `openclaw:release.detail.open?release=9` | `release` | `query-release-detail` | no |
| `release.list.open` | `openclaw:release.list.open?product=2` | `product` | `query-releases` | no |
| `testtask.detail.open` | `openclaw:testtask.detail.open?testtask=17` | `testtask` | `query-testtask-detail` | no |
| `testtask.cases.open` | `openclaw:testtask.cases.open?testtask=17` | `testtask` | `query-testtask-cases` | no |
| `test.exit.readiness.open` | `openclaw:test.exit.readiness.open?testtask=17&execution=3&product=2` | any context field | `query-test-exit-readiness` | no |
| `closure.items.open` | `openclaw:closure.items.open?testtask=17&execution=3&product=2` | any context field | `query-closure-items` | no |
| `go.live.checklist.open` | `openclaw:go.live.checklist.open?testtask=17&execution=3&product=2` | any context field | `query-go-live-checklist` | no |
| `acceptance.overview.open` | `openclaw:acceptance.overview.open?testtask=17&execution=3&product=2` | any context field | `query-acceptance-overview` | no |
| `closure.readiness.open` | `openclaw:closure.readiness.open?testtask=17&execution=3&product=2` | any context field | `query-closure-readiness` | no |
| `execution.tasks.open` | `openclaw:execution.tasks.open?execution=3` | `execution` | `query-execution-tasks` | no |
| `execution.stories.open` | `openclaw:execution.stories.open?execution=3` | `execution` | `query-execution-stories` | no |
| `execution.team.open` | `openclaw:execution.team.open?execution=3` | `execution` | `query-execution-team` | no |
| `task.status.start` | `openclaw:task.status.start?task=123&status=doing` | `task` | `update-task-status` | yes |
| `task.status.finish` | `openclaw:task.status.finish?task=123&status=done` | `task` | `update-task-status` | yes |
| `task.status.block` | `openclaw:task.status.block?task=123&status=pause` | `task` | `update-task-status` | yes |
| `task.status.submit` | `openclaw:task.status.submit?task=123` | `task` | `update-task-status` | yes |
| `bug.status.activate` | `openclaw:bug.status.activate?bug=101&status=activate` | `bug` | `update-bug-status` | yes |
| `bug.status.resolve` | `openclaw:bug.status.resolve?bug=101&status=resolve&resolution=fixed` | `bug` | `update-bug-status` | yes |
| `bug.status.close` | `openclaw:bug.status.close?bug=101&status=close` | `bug` | `update-bug-status` | yes |
| `bug.status.submit` | `openclaw:bug.status.submit?bug=101` | `bug` | `update-bug-status` | yes |
| `story.status.submit` | `openclaw:story.status.submit?story=88&status=close` | `story` | `update-story-status` | yes |
| `story.review.submit` | `openclaw:story.review.submit?story=88` | `story` | `review-story` | yes |
| `release.status.submit` | `openclaw:release.status.submit?release=9&status=normal` | `release` | `update-release-status` | yes |
| `testtask.case.run.submit` | `openclaw:testtask.case.run.submit?run=66` | `run` | `run-testtask-case` | no |

## Dispatcher Notes

回调处理链路：

1. `parseInteractiveActionKey(raw)`
2. `getInteractiveActionDefinition(actionKey)`
3. `buildInteractiveRouteArgs(...)`
4. `validateInteractiveAction(...)`
5. `collectMissingArgs(...)`
6. `runScript(route, args)`
7. `buildScriptResultReply(...)`

## Special Checks

### 1. Missing Payload

- 如果按钮缺必填字段，例如 `task.detail.open` 没带 `task`
- 预期：`collectMissingArgs` 拦住，返回缺参提示

### 2. Duplicate Callback

- 同一 `operation_id` 二次回调
- 预期：返回“该卡片操作已处理”

### 3. Illegal State Transition

- 例如已关闭 Bug 再点不允许的流转
- 预期：`validateInteractiveAction` 拦截并返回失败提示

### 4. Old Card / Stale State

- 模板层曾展示过按钮，但实体最新状态已变化
- 预期：回调层二次校验失败，不执行脚本

## Suggested Debug Payload

联调时建议关注这些字段：

- `interactive_action`
- `interactive_operation_id`
- `interactive_task_id`
- `interactive_selected`
- `route_script`
- `route_args`
- `matched_by`
- `current_status`

## Notes

- 当前所有打开详情或列表的按钮动作，原则上都不做状态校验。
- 当前所有状态流转动作，原则上都需要回调层再校验一次。
