# Intent Card Type Test List

Source:

- [intent-routing.yaml](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/agents/modules/intent-routing.yaml)
- [INTENT_CARD_TYPE_REFINEMENT.md](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/INTENT_CARD_TYPE_REFINEMENT.md)

## Purpose

- 记录当前各 intent 对应的卡片类型。
- 给回归测试和交互卡验收提供统一清单。

## Official Card Types

- `text_notice`
- `news_notice`
- `button_interaction`
- `multiple_interaction`
- `vote_interaction`

## Current Summary

| current_card_type | count |
| --- | ---: |
| `text_notice` | 7 |
| `button_interaction` | 24 |
| `multiple_interaction` | 5 |
| `vote_interaction` | 1 |

## Target Summary

| target_card_type | count |
| --- | ---: |
| `text_notice` | 7 |
| `button_interaction` | 24 |
| `multiple_interaction` | 5 |
| `vote_interaction` | 1 |
| `news_notice` | 0 |

## Latest Update

以下 intent 已在当前代码中落地为 `button_interaction`，回归测试时按“当前已实现”处理：

| intent | current status | buttons |
| --- | --- | --- |
| `query-test-exit-readiness` | implemented | `查看测试单` / `查看关闭阻塞项` / `查看上线检查` |
| `query-go-live-checklist` | implemented | `查看发布列表` / `查看关闭阻塞项` / `查看验收概览` |
| `query-acceptance-overview` | implemented | `查看关闭准备` / `查看关闭阻塞项` / `查看测试单` |
| `query-closure-readiness` | implemented | `查看关闭阻塞项` / `查看验收概览` / `查看发布列表` |
| `query-closure-items` | implemented | `查看相关任务` / `查看相关Bug` / `查看相关需求` / `查看相关发布` |
| `query-my-stories` | implemented | `查看首条需求` |
| `query-execution-tasks` | implemented | `查看首条任务` |
| `query-product-stories` | implemented | `查看首条需求` |
| `query-testtasks` | implemented | `查看首条测试单` / `查看首条用例` |
| `query-testtask-detail` | implemented | `查看用例` / `查看准出` |
| `query-releases` | implemented | `查看首条发布` |

## Rules

- `current_card_type` 表示当前代码已落地的卡片类型。
- `target_card_type` 表示当前测试应以什么类型验收。
- `keep` 表示当前实现就是目标实现。
- `p1` 表示偏列表导航增强。
- `p0` 表示偏流程闭环增强。

## Full List

| No. | intent | current_card_type | target_card_type | priority | test keyword | interaction copy | state rule |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `query-my-tasks` | `button_interaction` | `button_interaction` | `keep` | `我的任务` | `查看首条任务` / `查看我的Bug` | 列表导航卡，不按任务状态裁剪 |
| 2 | `query-my-bugs` | `button_interaction` | `button_interaction` | `keep` | `我的bug` | `查看首条Bug` | 列表导航卡，不按 Bug 状态裁剪 |
| 3 | `query-my-stories` | `button_interaction` | `button_interaction` | `keep` | `我的需求` | `查看首条需求` | 列表导航卡，无产品上下文时可直接测试 |
| 4 | `query-products` | `text_notice` | `text_notice` | `keep` | `产品列表` | `-` | `-` |
| 5 | `query-product-modules` | `text_notice` | `text_notice` | `keep` | `产品模块 1` | `-` | `-` |
| 6 | `query-projects` | `text_notice` | `text_notice` | `keep` | `项目列表` | `-` | `-` |
| 7 | `query-executions` | `button_interaction` | `button_interaction` | `keep` | `执行列表 1` | `查看执行任务` / `查看执行需求` / `查看执行团队` | 列表导航卡 |
| 8 | `query-execution-stories` | `button_interaction` | `button_interaction` | `keep` | `执行需求 1` | `查看首条需求` | 列表导航卡 |
| 9 | `query-execution-tasks` | `button_interaction` | `button_interaction` | `keep` | `执行任务 1` | `查看首条任务` | 列表导航卡 |
| 10 | `query-project-team` | `text_notice` | `text_notice` | `keep` | `项目团队 1` | `-` | `-` |
| 11 | `query-execution-team` | `text_notice` | `text_notice` | `keep` | `执行团队 1` | `-` | `-` |
| 12 | `query-product-stories` | `button_interaction` | `button_interaction` | `keep` | `产品需求 1` | `查看首条需求` | 列表导航卡 |
| 13 | `query-story-detail` | `button_interaction` | `button_interaction` | `keep` | `需求详情 1` | `关闭需求` / `激活需求` | 按需求状态裁剪按钮 |
| 14 | `query-task-detail` | `button_interaction` | `button_interaction` | `keep` | `任务详情 1` | `开始任务` / `完成任务` / `阻塞任务` | 按任务状态裁剪按钮 |
| 15 | `query-bug-detail` | `button_interaction` | `button_interaction` | `keep` | `bug详情 1` | `激活Bug` / `解决Bug` / `关闭Bug` | 按 Bug 状态裁剪按钮 |
| 16 | `query-testcases` | `text_notice` | `text_notice` | `keep` | `测试用例 1` | `-` | `-` |
| 17 | `query-testtasks` | `button_interaction` | `button_interaction` | `keep` | `测试单 1` | `查看首条测试单` / `查看首条用例` | 列表导航卡 |
| 18 | `query-testtask-detail` | `button_interaction` | `button_interaction` | `keep` | `测试单详情 1` | `查看用例` / `查看准出` | 详情导航卡 |
| 19 | `query-testtask-cases` | `button_interaction` | `button_interaction` | `keep` | `测试单用例 1` | `执行首条用例` | 列表导航卡 |
| 20 | `query-test-exit-readiness` | `button_interaction` | `button_interaction` | `keep` | `测试准出 1` | `查看测试单` / `查看关闭阻塞项` / `查看上线检查` | 判断卡 |
| 21 | `query-go-live-checklist` | `button_interaction` | `button_interaction` | `keep` | `上线检查 1` | `查看发布列表` / `查看关闭阻塞项` / `查看验收概览` | 判断卡 |
| 22 | `query-acceptance-overview` | `button_interaction` | `button_interaction` | `keep` | `验收概览 1` | `查看关闭准备` / `查看关闭阻塞项` / `查看测试单` | 判断卡 |
| 23 | `query-closure-readiness` | `button_interaction` | `button_interaction` | `keep` | `关闭准备 1` | `查看关闭阻塞项` / `查看验收概览` / `查看发布列表` | 判断卡 |
| 24 | `query-closure-items` | `button_interaction` | `button_interaction` | `keep` | `关闭阻塞项 1` | `查看相关任务` / `查看相关Bug` / `查看相关需求` | 阻塞项处理入口卡 |
| 25 | `query-releases` | `button_interaction` | `button_interaction` | `keep` | `发布列表 1` | `查看首条发布` | 列表导航卡 |
| 26 | `query-release-detail` | `button_interaction` | `button_interaction` | `keep` | `发布详情 1` | `设为待发布` / `设为正常发布` / `设为发布失败` / `设为已终止` | 按发布状态裁剪按钮 |
| 27 | `create-product` | `text_notice` | `text_notice` | `keep` | `创建产品` | `-` | `-` |
| 28 | `create-product-with-modules` | `text_notice` | `text_notice` | `keep` | `创建产品并建模块` | `-` | `-` |
| 29 | `create-product-modules` | `text_notice` | `text_notice` | `keep` | `创建模块` | `-` | `-` |
| 30 | `create-story` | `text_notice` | `text_notice` | `keep` | `创建需求` | `-` | `-` |
| 31 | `review-story` | `vote_interaction` | `vote_interaction` | `keep` | `评审需求 1 pass` | `通过` / `驳回` / `需补充` | 关闭状态降级为只读 |
| 32 | `create-task` | `button_interaction` | `button_interaction` | `keep` | `创建任务` | `查看任务详情` | 创建结果卡 |
| 33 | `update-task-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新任务状态 1 doing` | `提交更新` | 表单交互卡 |
| 34 | `create-testcase` | `text_notice` | `text_notice` | `keep` | `创建测试用例` | `-` | `-` |
| 35 | `create-testtask` | `button_interaction` | `button_interaction` | `keep` | `创建测试单` | `查看测试单详情` / `查看测试单用例` | 创建结果卡 |
| 36 | `link-testtask-cases` | `text_notice` | `text_notice` | `keep` | `关联测试单用例 1` | `-` | `-` |
| 37 | `run-testtask-case` | `multiple_interaction` | `multiple_interaction` | `keep` | `执行测试用例 1 pass` | `提交结果` | 表单交互卡 |
| 38 | `create-bug` | `button_interaction` | `button_interaction` | `keep` | `创建bug` | `查看Bug详情` | 创建结果卡 |
| 39 | `assign-bug` | `text_notice` | `text_notice` | `keep` | `指派bug 1 zhangsan` | `-` | `-` |
| 40 | `update-bug-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新bug状态 1 resolve` | `提交更新` | 表单交互卡 |
| 41 | `create-release` | `button_interaction` | `button_interaction` | `keep` | `创建发布` | `查看发布详情` | 创建结果卡 |
| 42 | `link-release-items` | `text_notice` | `text_notice` | `keep` | `关联发布项 1` | `-` | `-` |
| 43 | `update-release-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新发布状态 1 closed` | `提交更新` | 表单交互卡 |
| 44 | `update-story-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新需求状态 1 closed` | `提交更新` | 表单交互卡 |

## Testing Notes

### Current Regression

- `query-my-tasks`
- `query-my-bugs`
- `query-my-stories`
- `query-task-detail`
- `query-bug-detail`
- `query-story-detail`
- `query-release-detail`
- `query-testtask-cases`
- `review-story`
- `update-task-status`
- `update-bug-status`
- `update-story-status`
- `update-release-status`
- `run-testtask-case`

### Navigation Regression

- `query-execution-tasks`
- `query-execution-stories`
- `query-executions`
- `query-product-stories`
- `query-releases`
- `query-testtasks`
- `query-testtask-detail`
- `query-my-stories`

## References

- [route_templates.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/agent_templates/route_templates.ts)
- [_helpers.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/agent_templates/_helpers.ts)
- [INTENT_CARD_TYPE_REFINEMENT.md](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/INTENT_CARD_TYPE_REFINEMENT.md)
