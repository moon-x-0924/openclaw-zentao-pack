# Button Interaction Manual Test

Source:

- [BUTTON_INTERACTION_TEST_CHECKLIST.md](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/BUTTON_INTERACTION_TEST_CHECKLIST.md)
- [route_templates.ts](/D:/StudioWorkSpace/openclaw/openclaw-zentao-pack/scripts/replies/agent_templates/route_templates.ts)

## Purpose

这份文档给人工点测使用，只关心：

- 用户发什么话
- 应该收到什么卡
- 卡上应该看到哪些按钮
- 点完以后应该跳到什么结果卡

## Smoke Test Order

1. `我的任务`
2. `我的bug`
3. `任务详情 1`
4. `bug详情 1`
5. `需求详情 1`
6. `发布详情 1`
7. `测试单详情 1`
8. `测试单用例 1`
9. `测试准出 1`
10. `上线检查 1`
11. `验收概览 1`
12. `关闭准备 1`
13. `关闭阻塞项 1`

## Manual Cases

| No. | user input | expected card_type | expected buttons | click expectation |
| --- | --- | --- | --- | --- |
| 1 | `我的任务` | `button_interaction` | `查看首条任务` / `查看我的Bug` | 分别进入任务详情卡、我的 Bug 卡 |
| 2 | `我的bug` | `button_interaction` | `查看首条Bug` | 进入 Bug 详情卡 |
| 3 | `创建任务 ...` | `button_interaction` | `查看任务详情` | 进入任务详情卡 |
| 4 | `创建bug ...` | `button_interaction` | `查看Bug详情` | 进入 Bug 详情卡 |
| 5 | `创建测试单 ...` | `button_interaction` | `查看测试单详情` / `查看测试单用例` | 分别进入测试单详情卡、测试单用例卡 |
| 6 | `创建发布 ...` | `button_interaction` | `查看发布详情` | 进入发布详情卡 |
| 7 | `执行列表 1` | `button_interaction` | `查看执行任务` / `查看执行需求` / `查看执行团队` | 分别进入执行任务卡、执行需求卡、执行团队卡 |
| 8 | `执行任务 1` | `button_interaction` | `查看首条任务` | 进入任务详情卡 |
| 9 | `执行需求 1` | `button_interaction` | `查看首条需求` | 进入需求详情卡 |
| 10 | `产品需求 1` | `button_interaction` | `查看首条需求` | 进入需求详情卡 |
| 11 | `发布列表 1` | `button_interaction` | `查看首条发布` | 进入发布详情卡 |
| 12 | `测试单 1` | `button_interaction` | `查看首条测试单` / `查看首条用例` | 分别进入测试单详情卡、测试单用例卡 |
| 13 | `测试单详情 1` | `button_interaction` | `查看用例` / `查看准出` | 分别进入测试单用例卡、测试准出卡 |
| 14 | `测试单用例 1` | `button_interaction` | `执行首条用例` | 进入执行用例表单卡 |
| 15 | `测试准出 1` | `button_interaction` | `查看测试单` / `查看关闭阻塞项` / `查看上线检查` | 分别进入测试单详情卡、关闭阻塞项卡、上线检查卡 |
| 16 | `上线检查 1` | `button_interaction` | `查看发布列表` / `查看关闭阻塞项` / `查看验收概览` | 分别进入发布列表卡、关闭阻塞项卡、验收概览卡 |
| 17 | `验收概览 1` | `button_interaction` | `查看关闭准备` / `查看关闭阻塞项` / `查看测试单` | 分别进入关闭准备卡、关闭阻塞项卡、测试单详情卡 |
| 18 | `关闭准备 1` | `button_interaction` | `查看关闭阻塞项` / `查看验收概览` / `查看发布列表` | 分别进入关闭阻塞项卡、验收概览卡、发布列表卡 |
| 19 | `关闭阻塞项 1` | `button_interaction` | `查看相关任务` / `查看相关Bug` / `查看相关需求` / `查看相关发布` | 分别进入对应详情卡 |
| 20 | `任务详情 1` | `button_interaction` | `开始任务` / `完成任务` / `阻塞任务` | 点后进入任务状态更新结果或表单链路 |
| 21 | `bug详情 1` | `button_interaction` | `激活Bug` / `解决Bug` / `关闭Bug` | 点后进入 Bug 状态更新结果或表单链路 |
| 22 | `需求详情 1` | `button_interaction` | `关闭需求` / `激活需求` | 点后进入需求状态更新结果或表单链路 |
| 23 | `发布详情 1` | `button_interaction` | `设为待发布` / `设为正常发布` / `设为发布失败` / `设为已终止` | 点后进入发布状态更新结果或表单链路 |

## Pass Rules

- 收到的必须是卡片，不是 JSON 字符串
- 卡片类型必须是 `button_interaction`
- 按钮文案和数量必须与当前场景一致
- 点击后返回的必须是当前路由体系内的下一张卡
- 如果当前实体状态不允许操作，应看到更少按钮或只读卡，而不是报错

## Notes

- 某些详情卡按钮会因状态不同而变化，这是正常现象。
- 如果点按钮后回复成文本 JSON，优先检查是否走了 agent 模板链路。
