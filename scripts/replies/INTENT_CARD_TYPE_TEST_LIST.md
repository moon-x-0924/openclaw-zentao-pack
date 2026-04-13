# Intent Card Type Test List

Source:

- [intent-routing.yaml](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/agents/modules/intent-routing.yaml)
- [INTENT_CARD_TYPE_REFINEMENT.md](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/INTENT_CARD_TYPE_REFINEMENT.md)

## Purpose

这份清单同时服务两类测试：

- 现状回归测试：确认当前代码里已经落地的卡片类型和交互是否正常
- 目标改造测试：确认哪些 `text_notice` 后续应升级为交互卡，并提前准备测试场景

## Official Card Types

企业微信模板卡片支持：

- `text_notice`
- `news_notice`
- `button_interaction`
- `multiple_interaction`
- `vote_interaction`

当前项目已落地：

- `text_notice`
- `button_interaction`
- `multiple_interaction`
- `vote_interaction`

当前项目未落地：

- `news_notice`

## Current Summary

| current_card_type | count |
| --- | ---: |
| `text_notice` | 7 |
| `button_interaction` | 23 |
| `multiple_interaction` | 5 |
| `vote_interaction` | 1 |

## Target Summary

| target_card_type | count |
| --- | ---: |
| `text_notice` | 7 |
| `button_interaction` | 23 |
| `multiple_interaction` | 5 |
| `vote_interaction` | 1 |
| `news_notice` | 0 |

## Latest Update

以下 5 个判断卡已在当前代码中落地为 `button_interaction`，回归测试时请按“当前已实现”处理：

| intent | current status | buttons |
| --- | --- | --- |
| `query-test-exit-readiness` | implemented | `查看测试单` / `查看关闭阻塞项` / `查看上线检查` |
| `query-go-live-checklist` | implemented | `查看发布列表` / `查看关闭阻塞项` / `查看验收概览` |
| `query-acceptance-overview` | implemented | `查看关闭准备` / `查看关闭阻塞项` / `查看测试单` |
| `query-closure-readiness` | implemented | `查看关闭阻塞项` / `查看验收概览` / `查看发布列表` |
| `query-closure-items` | implemented | `查看相关任务` / `查看相关Bug` / `查看相关需求` / `查看相关发布` |

以下 5 个 P1 导航卡也已在当前代码中落地为 `button_interaction`：

| intent | current status | buttons |
| --- | --- | --- |
| `query-execution-tasks` | implemented | `查看首条任务` |
| `query-product-stories` | implemented | `查看首条需求` |
| `query-testtasks` | implemented | `查看首条测试单` / `查看首条用例` |
| `query-testtask-detail` | implemented | `查看用例` / `查看准出` |
| `query-releases` | implemented | `查看首条发布` |

以下 6 个原 `text_notice` 卡已补为轻量导航交互：

| intent | current status | buttons |
| --- | --- | --- |
| `create-task` | implemented | `查看任务详情` |
| `create-bug` | implemented | `查看Bug详情` |
| `create-testtask` | implemented | `查看测试单详情` / `查看测试单用例` |
| `create-release` | implemented | `查看发布详情` |
| `query-executions` | implemented | `查看执行任务` / `查看执行需求` / `查看执行团队` |
| `query-execution-stories` | implemented | `查看首条需求` |

## Rules

- `current_card_type` 表示当前代码已落地的卡片类型
- `target_card_type` 表示建议改造后的卡片类型
- `priority` 含义：
  - `keep`：当前保持不变
  - `p1`：建议做列表导航增强
  - `p0`：建议优先升级为交互卡
- 已经落地的交互卡，继续按现状做回归测试
- 还未落地但建议升级的场景，先按目标交互准备测试用例

## Full List

| No. | intent | current_card_type | target_card_type | priority | test keyword | interaction copy | state rule |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `query-my-tasks` | `button_interaction` | `button_interaction` | `keep` | `我的任务` | `查看首条任务 / 查看我的Bug` | `列表导航卡，不按任务状态裁剪` |
| 2 | `query-my-bugs` | `button_interaction` | `button_interaction` | `keep` | `我的bug` | `查看首条Bug` | `列表导航卡，不按Bug状态裁剪` |
| 3 | `query-products` | `text_notice` | `text_notice` | `keep` | `产品列表` | `-` | `-` |
| 4 | `query-product-modules` | `text_notice` | `text_notice` | `keep` | `产品模块 1` | `-` | `-` |
| 5 | `query-projects` | `text_notice` | `text_notice` | `keep` | `项目列表` | `-` | `-` |
| 6 | `query-executions` | `text_notice` | `text_notice` | `keep` | `执行列表 1` | `-` | `-` |
| 7 | `query-execution-stories` | `text_notice` | `text_notice` | `keep` | `执行需求 1` | `-` | `-` |
| 8 | `query-execution-tasks` | `text_notice` | `button_interaction` | `p1` | `执行任务 1` | `查看首条任务 / 查看详情` | `列表导航卡，建议优先支持首条钻取` |
| 9 | `query-project-team` | `text_notice` | `text_notice` | `keep` | `项目团队 1` | `-` | `-` |
| 10 | `query-execution-team` | `text_notice` | `text_notice` | `keep` | `执行团队 1` | `-` | `-` |
| 11 | `query-product-stories` | `text_notice` | `button_interaction` | `p1` | `产品需求 1` | `查看首条需求 / 查看详情` | `列表导航卡，建议优先支持首条钻取` |
| 12 | `query-story-detail` | `button_interaction` | `button_interaction` | `keep` | `需求详情 1` | `关闭需求 / 激活需求` | `按需求状态裁剪按钮；无合法动作时降级只读卡` |
| 13 | `query-task-detail` | `button_interaction` | `button_interaction` | `keep` | `任务详情 1` | `开始任务 / 完成任务 / 阻塞任务` | `wait/pause -> 开始任务；doing -> 完成任务+阻塞任务；done/closed -> 无操作按钮，降级只读卡` |
| 14 | `query-bug-detail` | `button_interaction` | `button_interaction` | `keep` | `bug详情 1` | `激活Bug / 解决Bug / 关闭Bug` | `active -> 解决Bug+关闭Bug；resolved -> 激活Bug+关闭Bug；closed -> 激活Bug；其他状态 -> 无操作按钮，降级只读卡` |
| 15 | `query-testcases` | `text_notice` | `text_notice` | `keep` | `测试用例 1` | `-` | `-` |
| 16 | `query-testtasks` | `text_notice` | `button_interaction` | `p1` | `测试单 1` | `查看首条测试单 / 查看详情` | `列表导航卡，建议增加详情和关联用例入口` |
| 17 | `query-testtask-detail` | `text_notice` | `button_interaction` | `p1` | `测试单详情 1` | `查看用例 / 查看准出` | `详情导航卡，建议承接后续查看动作` |
| 18 | `query-testtask-cases` | `button_interaction` | `button_interaction` | `keep` | `测试单用例 1` | `执行首条例` | `列表导航卡，当前支持首条例执行入口` |
| 19 | `query-test-exit-readiness` | `text_notice` | `button_interaction` | `p0` | `测试准出 1` | `查看阻塞项 / 查看测试单 / 查看上线检查` | `判断卡，应直接承接下一步入口` |
| 20 | `query-go-live-checklist` | `text_notice` | `button_interaction` | `p0` | `上线检查 1` | `查看发布详情 / 查看阻塞项` | `门禁卡，应直接承接发布前处理动作` |
| 21 | `query-acceptance-overview` | `text_notice` | `button_interaction` | `p0` | `验收概览 1` | `确认关闭 / 查看遗留项` | `不满足关闭条件时不展示确认关闭` |
| 22 | `query-closure-readiness` | `text_notice` | `button_interaction` | `p0` | `关闭准备 1` | `确认关闭 / 查看阻塞项` | `不可关闭时不展示确认关闭` |
| 23 | `query-closure-items` | `text_notice` | `button_interaction` | `p0` | `关闭阻塞项 1` | `查看首个阻塞项 / 查看相关Bug / 查看相关任务` | `阻塞项卡应承接处理入口` |
| 24 | `query-releases` | `text_notice` | `button_interaction` | `p1` | `发布列表 1` | `查看首条发布 / 查看详情` | `列表导航卡，建议支持首条发布详情` |
| 25 | `query-release-detail` | `button_interaction` | `button_interaction` | `keep` | `发布详情 1` | `设为待发布 / 设为正常发布 / 设为发布失败 / 设为已终止` | `按当前发布状态裁剪按钮；无合法动作时降级只读卡` |
| 26 | `create-product` | `text_notice` | `text_notice` | `keep` | `创建产品` | `-` | `-` |
| 27 | `create-product-with-modules` | `text_notice` | `text_notice` | `keep` | `创建产品并建模块` | `-` | `-` |
| 28 | `create-product-modules` | `text_notice` | `text_notice` | `keep` | `创建模块` | `-` | `-` |
| 29 | `create-story` | `text_notice` | `text_notice` | `keep` | `创建需求` | `-` | `复杂创建结果回执，暂不建议卡片内继续编辑` |
| 30 | `review-story` | `vote_interaction` | `vote_interaction` | `keep` | `评审需求 1 pass` | `通过 / 驳回 / 需补充；提交评审` | `story.status=closed 时不再展示可提交投票，降级只读卡` |
| 31 | `create-task` | `text_notice` | `text_notice` | `keep` | `创建任务` | `-` | `复杂创建结果回执，暂不建议卡片内继续编辑` |
| 32 | `update-task-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新任务状态 1 doing` | `选择任务状态；待处理 / 进行中 / 已完成 / 已阻塞；备注策略；使用默认备注 / 不写备注；提交更新` | `wait/pause -> 仅进行中；doing -> 仅已完成+已阻塞；done/closed -> 无合法选项，降级只读卡` |
| 33 | `create-testcase` | `text_notice` | `text_notice` | `keep` | `创建测试用例` | `-` | `复杂创建结果回执，暂不建议卡片内继续编辑` |
| 34 | `create-testtask` | `text_notice` | `text_notice` | `keep` | `创建测试单` | `-` | `复杂创建结果回执，暂不建议卡片内继续编辑` |
| 35 | `link-testtask-cases` | `text_notice` | `text_notice` | `keep` | `关联测试单用例 1` | `-` | `多对象关联场景，暂不建议直接卡片交互` |
| 36 | `run-testtask-case` | `multiple_interaction` | `multiple_interaction` | `keep` | `执行测试用例 1 pass` | `执行结果；通过 / 失败 / 阻塞 / 暂不执行；实际结果策略；使用默认说明 / 不写说明；提交结果` | `当前已支持结果提交表单；后续可再补运行态校验` |
| 37 | `create-bug` | `text_notice` | `text_notice` | `keep` | `创建bug` | `-` | `复杂创建结果回执，暂不建议卡片内继续编辑` |
| 38 | `assign-bug` | `text_notice` | `text_notice` | `keep` | `指派bug 1 zhangsan` | `-` | `若无稳定候选责任人列表，暂不建议卡片内选人` |
| 39 | `update-bug-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新bug状态 1 resolve` | `选择Bug状态；激活 / 已解决 / 已关闭；备注策略；使用默认备注 / 不写备注；提交更新` | `active -> 仅已解决+已关闭；resolved -> 仅激活+已关闭；closed -> 仅激活；其他状态 -> 无合法选项，降级只读卡` |
| 40 | `create-release` | `text_notice` | `text_notice` | `keep` | `创建发布` | `-` | `复杂创建结果回执，暂不建议卡片内继续编辑` |
| 41 | `link-release-items` | `text_notice` | `text_notice` | `keep` | `关联发布项 1` | `-` | `多对象关联场景，暂不建议直接卡片交互` |
| 42 | `update-release-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新发布状态 1 closed` | `选择发布状态；待发布 / 正常发布 / 发布失败 / 已终止；说明策略；使用默认说明 / 不写说明；提交更新` | `按当前发布状态裁剪可选项；无合法流转时降级只读卡` |
| 43 | `update-story-status` | `multiple_interaction` | `multiple_interaction` | `keep` | `更新需求状态 1 closed` | `选择需求状态；已关闭 / 激活；关闭原因；已完成 / 已取消 / 不做；备注策略；使用默认备注 / 不写备注；提交更新` | `按当前需求状态裁剪可选项；无合法流转时降级只读卡` |

## P0 Upgrade Focus

以下 intent 建议优先纳入下一批交互卡改造和测试：

- `run-testtask-case`
- `query-test-exit-readiness`
- `query-go-live-checklist`
- `query-acceptance-overview`
- `query-closure-readiness`
- `query-closure-items`

补充说明：上述 P0 项当前均已落地，建议这里改为优先回归测试清单。

## P1 Navigation Focus

以下 intent 建议作为“列表导航卡”增强项：

- `query-execution-tasks`
- `query-product-stories`
- `query-testtasks`
- `query-testtask-detail`
- `query-testtask-cases`
- `query-releases`

补充说明：除 `query-testtask-cases` 外，上述 P1 项当前也已落地，建议纳入同一轮回归测试。

## Testing Notes

### Current Regression

先做当前已落地交互回归：

- `query-my-tasks`
- `query-my-bugs`
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

### Target Design Verification

再做目标交互设计校验：

- 查看目标 `interaction copy` 是否足够支撑业务闭环
- 查看目标 `state rule` 是否需要模板层和回调层双重校验
- 对 `p0` 场景优先补样例和测试数据

## References

- [route_templates.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/agent_templates/route_templates.ts)
- [_helpers.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/agent_templates/_helpers.ts)
- [INTENT_CARD_TYPE_REFINEMENT.md](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/INTENT_CARD_TYPE_REFINEMENT.md)
