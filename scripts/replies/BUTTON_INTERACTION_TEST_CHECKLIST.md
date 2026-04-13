# Button Interaction Test Checklist

Source:

- [intent-routing.yaml](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/agents/modules/intent-routing.yaml)
- [route_templates.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/agent_templates/route_templates.ts)
- [wecom_interactive_registry.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/callbacks/wecom_interactive_registry.ts)

## Purpose

- 只覆盖当前代码中已经落地的 `button_interaction` 卡片。
- 用于企业微信逐条点测。

## Summary

当前已落地 `button_interaction` 共 `24` 个：

1. `query-my-tasks`
2. `query-my-bugs`
3. `query-my-stories`
4. `create-bug`
5. `create-release`
6. `create-task`
7. `create-testtask`
8. `query-acceptance-overview`
9. `query-bug-detail`
10. `query-closure-items`
11. `query-closure-readiness`
12. `query-execution-stories`
13. `query-execution-tasks`
14. `query-executions`
15. `query-go-live-checklist`
16. `query-product-stories`
17. `query-release-detail`
18. `query-releases`
19. `query-story-detail`
20. `query-task-detail`
21. `query-test-exit-readiness`
22. `query-testtask-cases`
23. `query-testtask-detail`
24. `query-testtasks`

## Checklist

| No. | intent | test keyword | expected buttons | expected route |
| --- | --- | --- | --- | --- |
| 1 | `query-my-tasks` | `我的任务` | `查看首条任务` / `查看我的Bug` | `query-task-detail` / `query-my-bugs` |
| 2 | `query-my-bugs` | `我的bug` | `查看首条Bug` | `query-bug-detail` |
| 3 | `query-my-stories` | `我的需求` | `查看首条需求` | `query-story-detail` |
| 4 | `create-bug` | `创建bug` | `查看Bug详情` | `query-bug-detail` |
| 5 | `create-release` | `创建发布` | `查看发布详情` | `query-release-detail` |
| 6 | `create-task` | `创建任务` | `查看任务详情` | `query-task-detail` |
| 7 | `create-testtask` | `创建测试单` | `查看测试单详情` / `查看测试单用例` | `query-testtask-detail` / `query-testtask-cases` |
| 8 | `query-acceptance-overview` | `验收概览 1` | `查看关闭准备` / `查看关闭阻塞项` / `查看测试单` | `query-closure-readiness` / `query-closure-items` / `query-testtask-detail` |
| 9 | `query-bug-detail` | `bug详情 1` | `激活Bug` / `解决Bug` / `关闭Bug` | `update-bug-status` |
| 10 | `query-closure-items` | `关闭阻塞项 1` | `查看相关任务` / `查看相关Bug` / `查看相关需求` / `查看相关发布` | `query-task-detail` / `query-bug-detail` / `query-story-detail` / `query-release-detail` |
| 11 | `query-closure-readiness` | `关闭准备 1` | `查看关闭阻塞项` / `查看验收概览` / `查看发布列表` | `query-closure-items` / `query-acceptance-overview` / `query-releases` |
| 12 | `query-execution-stories` | `执行需求 1` | `查看首条需求` | `query-story-detail` |
| 13 | `query-execution-tasks` | `执行任务 1` | `查看首条任务` | `query-task-detail` |
| 14 | `query-executions` | `执行列表 1` | `查看执行任务` / `查看执行需求` / `查看执行团队` | `query-execution-tasks` / `query-execution-stories` / `query-execution-team` |
| 15 | `query-go-live-checklist` | `上线检查 1` | `查看发布列表` / `查看关闭阻塞项` / `查看验收概览` | `query-releases` / `query-closure-items` / `query-acceptance-overview` |
| 16 | `query-product-stories` | `产品需求 1` | `查看首条需求` | `query-story-detail` |
| 17 | `query-release-detail` | `发布详情 1` | `设为待发布` / `设为正常发布` / `设为发布失败` / `设为已终止` | `update-release-status` |
| 18 | `query-releases` | `发布列表 1` | `查看首条发布` | `query-release-detail` |
| 19 | `query-story-detail` | `需求详情 1` | `关闭需求` / `激活需求` | `update-story-status` |
| 20 | `query-task-detail` | `任务详情 1` | `开始任务` / `完成任务` / `阻塞任务` | `update-task-status` |
| 21 | `query-test-exit-readiness` | `测试准出 1` | `查看测试单` / `查看关闭阻塞项` / `查看上线检查` | `query-testtask-detail` / `query-closure-items` / `query-go-live-checklist` |
| 22 | `query-testtask-cases` | `测试单用例 1` | `执行首条用例` | `run-testtask-case` |
| 23 | `query-testtask-detail` | `测试单详情 1` | `查看用例` / `查看准出` | `query-testtask-cases` / `query-test-exit-readiness` |
| 24 | `query-testtasks` | `测试单 1` | `查看首条测试单` / `查看首条用例` | `query-testtask-detail` / `query-testtask-cases` |

## State Rules

- `query-bug-detail`
  - `active` 常见为 `解决Bug` / `关闭Bug`
  - `resolved` 常见为 `激活Bug` / `关闭Bug`
  - `closed` 常见为 `激活Bug`
- `query-task-detail`
  - `wait` / `pause` 常见为 `开始任务`
  - `doing` 常见为 `完成任务` / `阻塞任务`
  - 终态应降级为无按钮只读卡
- `query-story-detail`
  - 是否显示 `关闭需求` / `激活需求` 取决于当前需求状态
- `query-release-detail`
  - 按钮取决于当前发布状态

## Test Method

1. 先测列表导航卡
   - `query-my-tasks`
   - `query-my-bugs`
   - `query-my-stories`
   - `query-execution-tasks`
   - `query-execution-stories`
   - `query-executions`
   - `query-product-stories`
   - `query-releases`
   - `query-testtasks`
   - `query-testtask-cases`
2. 再测详情动作卡
   - `query-task-detail`
   - `query-bug-detail`
   - `query-story-detail`
   - `query-release-detail`
   - `query-testtask-detail`
3. 最后测判断卡
   - `query-test-exit-readiness`
   - `query-go-live-checklist`
   - `query-acceptance-overview`
   - `query-closure-readiness`
   - `query-closure-items`
4. 最后测创建结果卡
   - `create-task`
   - `create-bug`
   - `create-testtask`
   - `create-release`

## Notes

- `query-my-stories` 为本次新增测试项，入口关键词使用 `我的需求`。
- 句子 `查需求` 当前本地已做无上下文兜底，会走到 `query-my-stories`，手工验证时建议同时覆盖 `我的需求` 与 `查需求` 两种说法。
