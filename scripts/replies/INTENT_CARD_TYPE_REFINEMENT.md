# Intent Card Type Refinement

Source references:

- [intent-routing.yaml](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/agents/modules/intent-routing.yaml)
- [route_templates.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/agent_templates/route_templates.ts)
- [企业微信发送应用消息](https://developer.work.weixin.qq.com/document/path/90236)
- [禅道 RESTful API 手册](https://www.zentao.net/book/api/)
- [产品参考文档](/D:/StudioWorkSpace/openclaw/agency-agents/product/product-manager.md)

## Goal

在现有回复模板基础上，重新细化 `card_type` 使用规则，重点识别当前被归为 `text_notice`、但业务上更适合改为交互卡的 intent。

## Official Card Types

企业微信模板卡片当前可用类型：

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

## Refined Rules

### `text_notice`

适用于：

- 纯结果通知
- 纯说明卡
- 错误提示与下一步引导
- 不适合在企微卡片内继续编辑的结果回执

不适用于：

- 明显存在“立即下一步动作”的详情卡
- 标准状态流转卡
- 测试执行、评审、关闭确认这类轻决策场景

### `news_notice`

适用于：

- 工作台首页
- 入口汇总卡
- 角色导航卡
- 图文式总览与跳转

不建议用于：

- 强交互提交
- 状态流转提交

### `button_interaction`

适用于：

- 单步动作
- 详情页快捷操作
- 关闭确认
- 列表页钻取入口
- 从判断卡跳到下一步

### `multiple_interaction`

适用于：

- 状态流转
- 轻表单
- 固定枚举选择
- 执行结果录入

### `vote_interaction`

适用于：

- 评审
- 审批
- 通过/驳回/需补充这类结论型交互

## Priority Summary

### P0: Should Upgrade From `text_notice`

| intent | current | suggested | reason |
| --- | --- | --- | --- |
| `query-story-detail` | `text_notice` | `button_interaction` | 需求详情存在评审、关闭、激活等后续动作，不应长期只读 |
| `update-story-status` | `text_notice` | `multiple_interaction` | 标准状态流转场景，应改为轻表单 |
| `run-testtask-case` | `text_notice` | `multiple_interaction` | 执行用例是结构化提交，天然适合结果选择卡 |
| `query-release-detail` | `text_notice` | `button_interaction` | 发布详情应承接状态更新或查看关联项 |
| `update-release-status` | `text_notice` | `multiple_interaction` | 发布状态修改属于标准交互表单 |
| `query-test-exit-readiness` | `text_notice` | `button_interaction` | 准出判断后通常需要立即进入下一步 |
| `query-go-live-checklist` | `text_notice` | `button_interaction` | 上线检查结果应直接承接后续查看或确认 |
| `query-acceptance-overview` | `text_notice` | `button_interaction` | 验收概览天然对应关闭确认或查看遗留项 |
| `query-closure-readiness` | `text_notice` | `button_interaction` | 关闭前判断卡应该直接承接关闭或查看阻塞 |
| `query-closure-items` | `text_notice` | `button_interaction` | 阻塞项卡本质上是处理入口卡 |

### P1: Should Upgrade To Better Navigation Cards

| intent | current | suggested | reason |
| --- | --- | --- | --- |
| `query-product-stories` | `text_notice` | `button_interaction` | 产品需求列表建议支持首条钻取 |
| `query-execution-tasks` | `text_notice` | `button_interaction` | 执行任务列表建议支持首条钻取 |
| `query-testtasks` | `text_notice` | `button_interaction` | 测试单列表建议支持详情和关联用例入口 |
| `query-releases` | `text_notice` | `button_interaction` | 发布列表建议支持首条发布详情 |
| `query-testtask-detail` | `text_notice` | `button_interaction` | 测试单详情建议接查看用例或查看准出 |
| `query-testtask-cases` | `text_notice` | `button_interaction` | 用例列表建议接查看首条或执行首条 |

### P2: Keep As `text_notice` For Now

| intent | keep as | reason |
| --- | --- | --- |
| `create-product` | `text_notice` | 创建结果回执即可，复杂编辑不应放卡片内 |
| `create-product-with-modules` | `text_notice` | 多字段初始化结果，更适合结果通知 |
| `create-product-modules` | `text_notice` | 批量创建模块，不适合继续卡片编辑 |
| `create-story` | `text_notice` | 需求创建字段较多，应继续以结果回执为主 |
| `create-task` | `text_notice` | 创建任务后以结果回执为主 |
| `create-testcase` | `text_notice` | 测试用例字段复杂，卡片不适合承载编辑 |
| `create-testtask` | `text_notice` | 测试单创建后结果通知足够 |
| `link-testtask-cases` | `text_notice` | 关联动作通常涉及多对象选择 |
| `create-bug` | `text_notice` | Bug 创建字段较多，卡片继续做结果回执即可 |
| `assign-bug` | `text_notice` | 若没有稳定候选责任人列表，不建议直接卡片内选人 |
| `create-release` | `text_notice` | 创建发布结果回执即可 |
| `link-release-items` | `text_notice` | 涉及多对象关联，不宜先做卡片交互 |

## Detailed Interaction Design

### 1. `query-story-detail`

- Suggested `card_type`: `button_interaction`
- Suggested buttons:
  - `评审需求`
  - `关闭需求`
  - `激活需求`
- State rule:
  - `closed` 时不展示 `关闭需求`
  - 不可评审状态时不展示 `评审需求`
  - 非关闭状态时不展示 `激活需求`

### 2. `update-story-status`

- Suggested `card_type`: `multiple_interaction`
- Suggested fields:
  - `目标状态`
  - `备注策略`
- Optional extended field:
  - `关闭原因`
- State rule:
  - 按当前需求状态裁剪合法目标状态
  - 无合法目标状态时降级为只读 `text_notice`

### 3. `run-testtask-case`

- Suggested `card_type`: `multiple_interaction`
- Suggested fields:
  - `执行结果`
  - `备注策略`
- Suggested options:
  - `通过`
  - `失败`
  - `阻塞`
  - `暂不执行`
- State rule:
  - 已完成且不允许重复执行时降级只读

### 4. `query-release-detail`

- Suggested `card_type`: `button_interaction`
- Suggested buttons:
  - `更新发布状态`
  - `查看发布项`
- Optional buttons:
  - `查看遗留Bug`

### 5. `update-release-status`

- Suggested `card_type`: `multiple_interaction`
- Suggested fields:
  - `目标状态`
  - `备注策略`
- State rule:
  - 按当前发布状态裁剪可选项
  - 无合法流转时降级只读

### 6. `query-test-exit-readiness`

- Suggested `card_type`: `button_interaction`
- Suggested buttons:
  - `查看阻塞项`
  - `查看测试单`
  - `查看上线检查`

### 7. `query-go-live-checklist`

- Suggested `card_type`: `button_interaction`
- Suggested buttons:
  - `查看发布详情`
  - `查看阻塞项`

### 8. `query-acceptance-overview`

- Suggested `card_type`: `button_interaction`
- Suggested buttons:
  - `确认关闭`
  - `查看遗留项`
- State rule:
  - 不满足关闭条件时隐藏 `确认关闭`

### 9. `query-closure-readiness`

- Suggested `card_type`: `button_interaction`
- Suggested buttons:
  - `确认关闭`
  - `查看阻塞项`
- State rule:
  - 不可关闭时隐藏 `确认关闭`

### 10. `query-closure-items`

- Suggested `card_type`: `button_interaction`
- Suggested buttons:
  - `查看首个阻塞项`
  - `查看相关Bug`
  - `查看相关任务`

### 11. Navigation Upgrade Group

以下 intent 建议统一采用“列表导航卡”模式：

- `query-product-stories`
- `query-execution-tasks`
- `query-testtasks`
- `query-releases`
- `query-testtask-detail`
- `query-testtask-cases`

推荐最小按钮集合：

- `查看首条`
- `查看详情`

按对象补充可选按钮：

- `查看关联用例`
- `查看准出`
- `执行首条`

## State Validation Recommendations

所有从 `text_notice` 升级为交互卡的详情/状态流转 intent，都建议同时做两层校验：

1. 模板层裁剪
- 根据当前实体状态决定展示哪些按钮或选项
- 无合法动作时自动降级只读卡

2. 回调层二次校验
- 用户点击旧卡片时再次拉取实体最新状态
- 非法流转直接拒绝，并返回明确错误提示

## Suggested Delivery Order

### Phase 1

- `query-story-detail`
- `update-story-status`
- `run-testtask-case`
- `query-release-detail`
- `update-release-status`

### Phase 2

- `query-test-exit-readiness`
- `query-go-live-checklist`
- `query-acceptance-overview`
- `query-closure-readiness`
- `query-closure-items`

### Phase 3

- `query-product-stories`
- `query-execution-tasks`
- `query-testtasks`
- `query-releases`
- `query-testtask-detail`
- `query-testtask-cases`

### Phase 4

- 新增 `news_notice`
- 用于工作台首页、角色导航卡、入口汇总卡

## Final Recommendation

当前最需要调整的，不是继续新增底层 `card_type`，而是把一批带有明确下一步动作的 `text_notice` 迁移为更合适的交互卡。

优先原则：

- 有动作闭环的详情卡，优先 `button_interaction`
- 有状态流转的结果卡，优先 `multiple_interaction`
- 有评审结论的决策卡，优先 `vote_interaction`
- 纯通知、纯结果、复杂创建回执，继续 `text_notice`
- 工作台和入口总览，后续补 `news_notice`
