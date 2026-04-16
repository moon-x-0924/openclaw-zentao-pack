# 禅道最小 SOP 工作流（产品-研发-测试-管理）

本文是一份“最小但能完整走通”的禅道业务 SOP。

它的目标不是覆盖所有复杂分支，而是保证团队至少能按一条标准链路，从产品准备一路走到研发、测试、发布和最终收口。

适用场景：

- 新团队第一次用这套 ZenTao / OpenClaw 能力
- 需要一份按角色分工的最小闭环流程
- 希望先跑通主链路，再逐步增加复杂规则

不包含的范围：

- 立项审批、预算审批、合同审批
- 多项目并行排期博弈
- 多环境灰度、蓝绿、金丝雀等复杂发布策略
- 组织级权限申请与审计流程

## 1. 使用原则

这份 SOP 有 4 个原则：

1. 先跑通主链路，再补复杂分支。
2. 每一步都必须有“进入条件”和“完成标准”。
3. 下一个角色接手前，上一角色必须留下可验证结果。
4. 当前仓库没有单独沉淀“关闭执行”命令，所以用“收口完成”作为最小替代终点。

## 2. 最小前提

在当前仓库能力下，建议先满足以下前提：

1. 管理侧已经在禅道中建好项目和执行（迭代）。
2. 产品、研发、测试、管理成员都有可用禅道账号。
3. 团队已经约定本轮范围对应哪一个产品、项目、执行、构建。
4. 本轮要交付的需求范围已经基本明确，不会在执行当天大面积改方向。

说明：

- 当前仓库对“产品创建、需求创建、任务创建、测试执行、Bug 流转、发布、收口检查”支持较完整。
- “项目创建 / 执行创建”没有在当前仓库内形成统一最小工作流文档，因此本 SOP 默认它们已存在。
- 你之前提到的“关闭执行”，在当前仓库中更接近“把执行范围内的任务、需求、Bug、发布都收干净，再做关闭准备度检查”。

## 3. 角色边界

### 产品

负责：

- 创建产品与模块
- 创建需求
- 推动需求评审通过
- 明确验收标准
- 在最终阶段确认需求是否可关闭

### 研发

负责：

- 把需求落实到执行
- 创建并推进任务
- 修复 Bug
- 配合发布与最终收口

### 测试

负责：

- 创建测试用例
- 创建测试单
- 执行测试
- 提 Bug
- 回归 Bug
- 给出测试准出结论

### 管理

负责：

- 确认项目 / 执行存在
- 补充项目或执行成员
- 在上线前做范围核对
- 创建发布并关联交付项
- 组织最终收口

## 4. 对象关系

这条最小链路里，建议按下面的对象顺序理解：

`产品 -> 模块 -> 需求 -> 执行 -> 任务 -> 测试用例 -> 测试单 -> Bug -> 发布 -> 收口`

其中最关键的 4 条关系是：

1. 需求属于产品，并最终要关联到执行。
2. 任务挂在执行下，最好同时能关联到对应需求。
3. 测试用例归产品，测试单通常绑定产品、执行和构建。
4. Bug 最好同时关联到产品、执行、需求、测试用例、run、testtask，这样后续回归和收口最清晰。

## 5. 一轮最小闭环需要准备哪些编号

执行前，团队最好先把这些编号记下来：

- `productId`
- `projectId`
- `executionId`
- `storyId`
- `taskId`
- `caseId`
- `testtaskId`
- `bugId`
- `releaseId`
- `buildId`

如果你们已经在禅道里有固定项目 / 执行，建议在一次完整流程里维护一份“本轮编号表”，避免不同角色拿错对象。

## 6. 端到端最小流程

### Step 0 管理：确认项目、执行、团队已就绪

目标：

- 明确这轮需求落在哪个项目和执行中
- 确认相关成员已在项目或执行团队中

进入条件：

- 团队决定本轮要推进哪个业务范围

建议操作：

```bash
npm run query-projects -- --program all --status all
npm run query-executions
npm run query-project-team -- --project <projectId>
npm run query-execution-team -- --execution <executionId>
```

如果成员不完整，再补成员：

```bash
npm run add-team-member -- --scope project --root <projectId> --account <account> --days 15 --hours 7
npm run add-team-member -- --scope execution --root <executionId> --account <account> --days 10 --hours 7
```

完成标准：

- 项目存在
- 执行存在
- 产品、研发、测试角色都已在团队名单内

下一步进入条件：

- 团队已经明确“这轮要在哪个执行里交付”

常见失败点：

- 研发或测试人员不在执行团队里，后面会出现指派或统计异常
- 大家口头说的是同一轮需求，但实际操作的不是同一个执行

### Step 1 产品：创建产品并初始化模块

目标：

- 建立产品载体
- 建好需求、任务、用例会用到的产品模块

进入条件：

- 这是一个新产品，或当前产品还没有对应模块结构

建议操作：

```bash
npm run create-product -- --name "SmartSupport" --po admin --qd admin --rd admin
npm run create-product-modules -- --product <productId> --modules Workbench,TicketCenter,KnowledgeBase,Reports
```

如果想一体化执行：

```bash
npm run create-product-with-modules -- --name "SmartSupport" --po admin --qd admin --rd admin --modules Workbench,TicketCenter,KnowledgeBase,Reports
```

需要确认的细节：

- 模块名在同一次请求中不能重复
- 目标产品下不能已有同名模块
- 如果表单不支持 `code` 之类字段，不要强行假设已写入

完成标准：

- 产品创建成功
- 产品模块创建成功
- 模块列表符合后续需求拆分习惯

下一步进入条件：

- 产品经理知道需求该挂在哪个产品和模块下

常见失败点：

- 产品刚创建成功，但没有模块，后面创建需求或测试用例会缺归属
- 模块随便命名，导致后面任务和用例挂载混乱

### Step 2 产品：创建需求并完成评审

目标：

- 把业务诉求沉淀成正式需求
- 在进入研发前完成最小评审

进入条件：

- 产品、模块已就绪
- 需求标题、规格、验收标准已经基本明确

建议操作：

```bash
npm run create-story -- --product <productId> --title "新增智能助手入口" --spec "描述需求规格" --verify "描述验收标准" --reviewer admin --assigned-to admin --pri 3 --estimate 8
npm run query-product-stories -- --product <productId>
npm run query-story-detail -- --story <storyId>
```

确认需求信息无误后评审：

```bash
npm run review-story -- --story <storyId> --result pass --assigned-to admin --pri 3 --estimate 8 --comment "review passed"
```

如果评审不通过，可参考：

- `clarify`：需要补充信息
- `reject`：需求不进入当前开发

完成标准：

- 需求创建成功
- 需求可在详情中查到
- 需求已进入可研发状态

下一步进入条件：

- 产品确认“这条需求已可以交给研发落执行”

常见失败点：

- 没写清验收标准，导致测试阶段频繁返工
- 需求还在评审中就先建任务，后面容易范围漂移

### Step 3 研发：把需求关联到执行

目标：

- 明确该需求属于哪个执行
- 后续任务、测试、发布都沿同一执行范围推进

进入条件：

- 需求已经评审通过或达到可研发状态
- 执行已经存在

建议操作：

```bash
npm run link-execution-stories -- --execution <executionId> --story-ids <storyId>
npm run query-execution-stories -- --execution <executionId>
```

完成标准：

- 需求已成功关联到执行
- 执行需求列表里能看到该需求

下一步进入条件：

- 研发能够确认“任务应该建在哪个执行下”

常见失败点：

- 需求还没挂到执行，就先创建任务，后面报表和追踪链路会断
- 同一个需求被误挂到错误执行

### Step 4 研发：拆任务、开始开发、推进状态

目标：

- 把需求拆成可交付任务
- 让任务状态真实反映开发进度

进入条件：

- 需求已关联执行
- 研发已经知道本轮要交付什么

建议操作：

```bash
npm run create-task -- --execution <executionId> --story <storyId> --name "登录页开发-阶段2" --assigned-to admin --pri 3 --estimate 4
npm run query-execution-tasks -- --execution <executionId>
npm run query-task-detail -- --task <taskId>
```

开发开始时建议显式进入处理中：

```bash
npm run update-task-status -- --task-id <taskId> --status doing --consumed-hours 1 --left-hours 7 --comment "start task"
```

开发完成后标记完成：

```bash
npm run update-task-status -- --task-id <taskId> --status done --consumed-hours 4 --comment "finish task"
```

如果发现还没做完，可重新激活：

```bash
npm run update-task-status -- --task-id <taskId> --status activate --left-hours 1 --comment "reactivate task"
```

完成标准：

- 任务已创建
- 任务已分配明确负责人
- 开发阶段的状态变化在禅道中可追踪

下一步进入条件：

- 至少有一批可提测内容
- 研发知道对应构建或交付包

常见失败点：

- 任务状态一直停在 `wait`，实际开发已完成，测试难以判断何时接手
- 任务不关联需求，后续闭环时难判断哪条需求已被覆盖

### Step 5 测试：创建测试用例

目标：

- 为当前需求建立最小可执行测试资产

进入条件：

- 需求已经明确
- 测试知道主流程和验收标准

建议操作：

```bash
npm run create-testcase -- --product <productId> --story <storyId> --title "登录流程校验" --steps "打开登录页||输入正确账号密码||点击登录" --expects "展示登录页||允许输入||成功进入首页"
npm run query-testcases -- --product <productId>
```

完成标准：

- 用例已创建
- 用例标题、步骤、期望结果完整
- 用例能回溯到目标需求

下一步进入条件：

- 有至少一批可执行用例可以进入测试单

常见失败点：

- 只有需求，没有用例，后面很难证明“到底测了什么”
- 步骤和期望结果写得太粗，导致回归口径不一致

### Step 6 测试：创建测试单并接收提测

目标：

- 把研发交付内容正式移交给 QA
- 明确本轮测试范围、时间和负责人

进入条件：

- 研发已有可提测构建
- 测试用例已经至少覆盖主流程

建议操作：

```bash
npm run create-testtask -- --product <productId> --execution <executionId> --build <buildId> --name "登录功能提测" --begin 2026-03-23 --end 2026-03-23 --owner admin
npm run query-testtasks -- --product <productId> --execution <executionId>
```

完成标准：

- 测试单已创建
- 测试单绑定了正确的产品、执行、构建
- 测试负责人明确

下一步进入条件：

- 测试单中可以开始挂用例并执行

常见失败点：

- 测试单建错产品或执行，后面 Bug 和结果会跑偏
- 没确认 build，导致测试和研发说的不是同一版

### Step 7 测试：挂用例、执行测试、沉淀结果

目标：

- 把测试用例放入测试单
- 把实际测试结果沉淀下来

进入条件：

- 测试单已创建
- 至少有可执行用例

建议操作：

```bash
npm run link-testtask-cases -- --testtask <testtaskId> --cases <caseId>
npm run query-testtask-cases -- --testtask <testtaskId>
npm run run-testtask-case -- --run <runId> --result pass --real "case passed in validation"
```

如果用例失败，不要只留口头结论，应当转正式 Bug。

完成标准：

- 测试单里能看到已挂接用例
- 每个关键用例都有执行结果
- 通过 / 失败 / 阻塞结果有据可查

下一步进入条件：

- 对失败用例已经决定是否转 Bug

常见失败点：

- 直接在群里说“这个没过”，但测试单里没有执行记录
- 失败没有转 Bug，后面修复和回归都不可追踪

### Step 8 测试：提 Bug，研发接手修复

目标：

- 把失败结果沉淀成正式缺陷
- 让研发进入修复流程

进入条件：

- 测试执行发现真实问题

建议操作：

```bash
npm run create-bug -- --product <productId> --execution <executionId> --story <storyId> --case <caseId> --run <runId> --testtask <testtaskId> --title "登录失败" --builds <buildId> --assigned-to admin --severity 3 --pri 3 --steps "Step: failed\nResult: fail\nExpect: pass"
npm run query-product-bugs -- --product <productId>
npm run query-bug-detail -- --bug <bugId>
```

研发接手时再指派：

```bash
npm run assign-bug -- --bug <bugId> --assigned-to <rdAccount> --comment "repair owner set"
```

完成标准：

- Bug 已创建
- Bug 已关联产品、执行、需求、case、run、testtask
- Bug 已明确修复责任人

下一步进入条件：

- 研发开始修复

常见失败点：

- Bug 没关联到 testtask 或 run，后面回归时链路不完整
- 责任人不明确，缺陷滞留

### Step 9 研发 + 测试：修复、回归、决定关闭还是重开

目标：

- 研发完成修复
- 测试对已解决问题做回归判断

进入条件：

- Bug 已分派给研发
- 研发已经提交可回归版本

建议操作：

```bash
npm run query-regression-bugs -- --product <productId> --execution <executionId>
```

如果回归通过：

```bash
npm run update-bug-status -- --bug-id <bugId> --status close --comment regression_passed
```

如果回归失败：

```bash
npm run update-bug-status -- --bug-id <bugId> --status activate --comment regression_failed
```

这一阶段通常会循环多次，直到关键 Bug 都被关闭。

完成标准：

- 回归通过的 Bug 已关闭
- 回归失败的 Bug 已重新激活
- 当前剩余 Bug 状态真实可信

下一步进入条件：

- 测试能开始判断是否达到准出条件

常见失败点：

- 研发口头说“修好了”，但 Bug 状态没动
- 测试已回归通过，但 Bug 没关，最后收口时会一直阻塞

### Step 10 测试：给出测试准出结论

目标：

- 对本轮测试单给出明确的 go / no-go 结论

进入条件：

- 关键用例已执行
- 当前缺陷状态基本稳定

建议操作：

```bash
npm run query-test-exit-readiness -- --testtask <testtaskId>
```

最小判断规则：

- 测试单状态应为 `done`
- 不应存在未执行、失败或阻塞中的关键用例
- 不应存在未关闭的关键 Bug

如果还不能准出，应返回上一步继续修复和回归。

完成标准：

- 测试明确给出“可发布”或“不可发布”

下一步进入条件：

- 结论为“可发布”

常见失败点：

- 测试没有给结论，只说“差不多可以”
- 用例虽然都执行了，但仍有高优先级活跃 Bug

### Step 11 管理：上线前总览检查

目标：

- 在创建发布前，从管理视角确认交付范围和产品视图是否一致

进入条件：

- 测试给出可发布结论

建议操作：

```bash
npm run query-releases -- --product <productId> --type all
npm run query-product-overview -- --product <productId>
npm run query-delivery-overview
```

重点要看：

- 当前产品已有多少发布记录
- 本次交付范围是否和团队认知一致
- 是否有明显遗漏的故事、任务或交付内容

完成标准：

- 管理能确认“本轮交付范围说得清、看得见”

下一步进入条件：

- 需要为本轮建立正式发布记录

常见失败点：

- 直接建发布，但没人先核对本轮到底交付了什么
- 发布名和交付范围脱节，后面验收难以对账

### Step 12 管理：创建发布并关联需求 / Bug

目标：

- 建立正式发布记录
- 把本轮交付的需求和 Bug 统一挂到发布下

进入条件：

- 测试已准出
- 管理已确认上线范围

建议操作：

```bash
npm run create-release -- --product <productId> --name "2026-03-24 登录功能发布" --date "2026-03-24" --desc "发布说明"
npm run link-release-items -- --release <releaseId> --story-ids <storyId> --bug-ids <bugId>
```

如需归一发布状态：

```bash
npm run update-release-status -- --release-id <releaseId> --status normal --comment "release normalized"
```

完成标准：

- 发布已创建
- 本轮需求已关联到发布
- 本轮已交付或已关闭的 Bug 已关联到发布
- 发布状态正常

下一步进入条件：

- 团队进入验收和收口阶段

常见失败点：

- 创建了发布，但没把需求和 Bug 挂进去
- 发布状态异常，最后 closure readiness 会被卡住

### Step 13 产品 + 管理：验收确认

目标：

- 从业务结果视角确认本轮是否达成验收

进入条件：

- 发布记录已建立
- 测试结论为可发布

建议操作：

```bash
npm run query-acceptance-overview -- --product <productId> --execution <executionId>
npm run query-go-live-checklist -- --product <productId> --execution <executionId>
```

这一步主要看：

- 当前是否“基本可验收 / 可验收”
- 是否还有明显上线前风险
- 产品是否认可本轮交付已满足主目标

完成标准：

- 产品和管理都认可可以进入收口

下一步进入条件：

- 已确认不再继续往当前执行里追加核心范围

常见失败点：

- 测试觉得能发，但产品并未真正确认验收口径
- 进入收口后又临时追加主需求，导致执行边界反复变化

### Step 14 研发 + 产品 + 管理：做最终收口

目标：

- 清掉阻塞最终关闭的对象
- 让当前执行达到“事实完成”

进入条件：

- 需求、任务、Bug、发布都已基本稳定

建议操作：

先处理任务收尾：

```bash
npm run update-task-status -- --task-id <taskId> --status done --consumed-hours 4 --comment "task finished for closure"
npm run update-task-status -- --task-id <taskId> --status closed --comment "task closed for closure"
```

再处理需求收尾：

```bash
npm run update-story-status -- --story <storyId> --status close --closed-reason done --comment "accepted and closed"
```

最后做收口检查：

```bash
npm run query-closure-items -- --product <productId> --execution <executionId>
npm run query-closure-readiness -- --product <productId> --execution <executionId>
```

最小通过标准：

- `open_tasks = 0`
- `active_stories = 0`
- `unresolved_bugs = 0`
- `non_normal_releases = 0`

说明：

- 这一步就是当前仓库里最接近“关闭执行”的最小替代方案。
- 当前不是直接执行一个“关闭执行”动作，而是把执行范围内所有阻塞项收干净，再通过收口检查确认已满足关闭条件。

完成标准：

- 收口检查通过
- 当前执行范围内不再有明显遗留阻塞项

最终结束标志：

- 需求已关闭
- 任务已关闭
- Bug 已关闭或已明确不阻塞
- 发布状态正常
- 收口准备度通过

## 7. 一轮最小闭环的责任交接

| 阶段 | 主角色 | 交付物 | 接手角色 |
| --- | --- | --- | --- |
| 项目与执行确认 | 管理 | 项目 / 执行 / 团队范围 | 产品 |
| 产品初始化 | 产品 | 产品、模块 | 产品 |
| 需求评审 | 产品 | 可研发需求 | 研发 |
| 执行落位 | 研发 | 已关联执行的需求 | 研发 |
| 任务开发 | 研发 | 可提测任务与构建 | 测试 |
| 测试准备 | 测试 | 用例、测试单 | 测试 |
| 测试执行 | 测试 | 执行结果、Bug | 研发 |
| 缺陷修复回归 | 研发 + 测试 | 关闭或重开的 Bug 状态 | 测试 |
| 准出判断 | 测试 | go / no-go 结论 | 管理 |
| 发布归档 | 管理 | 发布记录、关联项 | 产品 + 管理 |
| 验收确认 | 产品 + 管理 | 验收结论 | 研发 + 管理 |
| 最终收口 | 研发 + 产品 + 管理 | 收口通过 | 结束 |

## 8. 最小跑通检查清单

如果你想判断这一轮 SOP 是否真的走通，至少要回答下面这些问题：

1. 产品是不是已经建好，并且模块结构可用？
2. 需求是不是已创建，并且评审通过？
3. 需求是不是已经关联到正确执行？
4. 任务是不是已创建，并且状态真实反映开发进度？
5. 测试用例和测试单是不是都建好了？
6. 测试执行结果是不是落在禅道里，而不是只留在聊天记录里？
7. 失败项是不是都转成了可追踪 Bug？
8. Bug 修复后是不是做了回归，并关闭或重开？
9. 测试是不是给出了明确准出结论？
10. 发布是不是创建了，并且挂上了需求和 Bug？
11. 需求、任务、Bug、发布是不是都已经达到收口要求？

只要上面 11 个问题都能回答“是”，这条最小 SOP 就算完整跑通。

## 9. 后续扩展建议

如果这版你觉得顺手，下一步我建议继续拆成 3 份配套文档：

1. 产品视角版 SOP
2. 研发 / 测试协同版 SOP
3. 管理收口版 SOP

这样团队不同角色拿到的文档会更短，也更贴近各自日常操作。
