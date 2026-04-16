# task 后台通知热修回写说明

## 1. 目的

这份说明用于把服务器上已经生效的 `task/model.php` 热修整理成仓库正式资产，避免后续因为升级、重建或覆盖部署丢失。

当前仓库内的可追踪落点：

- 热修源码副本：`references/server-hotfixes/task-model-2026-04-16.php`
- 本说明：`docs/overview/task后台通知热修回写说明.md`

当前线上目标文件：

- 禅道生效文件：`/opt/zbox/app/zentao/module/task/model.php`

## 2. 先说结论

- 这类热修改的是服务器磁盘上的真实 PHP 文件，不会因为“重启服务器”自动消失。
- 真正的风险不是重启，而是：
  - 禅道升级
  - 覆盖部署
  - 重建环境
  - 手工替换回旧文件
- 所以这次回写的核心目标，不是“防重启丢失”，而是“防后续覆盖后没人知道改过什么”。

## 3. 这次热修补了什么

这次热修是在服务器 `task/model.php` 上补强 `task` 后台操作到企微通知 bridge 的兜底。

核心点：

- 新增 `postTaskStatusWebhookByAction()`，把后台状态动作统一映射到 webhook 动作。
- 在以下状态流转后补发 webhook：
  - `activate`
  - `start`
  - `restart`
  - `finish`
  - `pause`
  - `cancel`
  - `close`
- 如果同一次状态流转中 `assignedTo` 也变了，会额外补发一次 `assigned` 事件。

这样做的目的，是让“禅道后台直接操作任务”也能进入：

- `zentao-wecom-webhook.service`
- `tmp/notification-audit/notification-audit.jsonl`

而不是只有技能包脚本入口能发通知。

## 4. 仓库里的源码副本怎么用

`references/server-hotfixes/task-model-2026-04-16.php` 不是线上自动生效文件，它的作用是：

- 作为这次服务器热修的可回读源码副本
- 作为后续升级、迁移、重建环境时的比对基线
- 让以后不必再去服务器上手工翻旧文件判断当时改了什么

约定：

- 线上生效仍以服务器真实文件为准
- 仓库副本负责“留痕、回读、重放”
- 如果后续再次调整热修逻辑，优先更新仓库副本和本说明，再部署到服务器

## 5. 重放步骤

如果后续因为升级或覆盖导致热修消失，按下面步骤重放：

1. 备份服务器当前文件
   - 目标文件：`/opt/zbox/app/zentao/module/task/model.php`
2. 用仓库副本对照或覆盖目标文件
   - 来源文件：`references/server-hotfixes/task-model-2026-04-16.php`
3. 重载 Web 服务 / PHP 运行环境
   - 至少要让 PHP 重新加载文件
4. 如果线上启用了 opcache，必要时一并清理 / 重置缓存
5. 用真实 task 动作做一次最小验证
   - 看 `journalctl -u zentao-wecom-webhook.service`
   - 看 `tmp/notification-audit/notification-audit.jsonl`
   - 看 `docs/overview/通知链路记录.md`

## 6. 最小验收口径

重放后，至少确认下面三件事：

1. 后台改任务状态后，bridge 有收到请求
2. `notification-audit` 有新增记录
3. 记录里的事件类型符合预期
   - `status_changed`
   - `assignee_changed`

注意：

- 如果审计里出现 `no matched notification rule`，说明桥接链路已通，但规则层还没补齐，不等于热修失效。
- 当前这类待补规则主要见 backlog 的 `B-008`。

## 7. 当前边界

这次回写解决的是“服务器热修不可追踪”的问题，不等于下面这些也已完成：

- 所有 task 状态都有完整通知规则
- 后台插件触发回归已经全自动化
- 禅道升级后能自动重新打补丁

这些仍属于后续事项。
