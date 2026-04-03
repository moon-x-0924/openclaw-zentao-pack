# 企业微信回调入口说明

当 OpenClaw 服务已经收到企业微信应用回调，并且需要把当前发送人解析成对应的禅道用户，再根据消息内容执行禅道查询或操作时，使用这条链路。

当前回调链路遵循统一的固定机器人账号登录模型：

1. OpenClaw 始终使用 `zentao.config.json` 中配置的固定机器人账号登录禅道。
2. 当前企业微信发送人 `userid` 会优先通过数据库映射链路匹配到对应的禅道用户；如果匹配不到，必须提示用户手动提供工号或禅道账号。
3. 实际查询脚本和动作脚本使用“当前映射到的禅道账号”作为操作者或目标用户，而不是继续使用发送人本人的禅道密码登录。
4. 发送人个人禅道密码不再作为默认登录路径。

## 当前回调能力

当前 `wecom_callback.ts` 已经不是只处理“我的任务 / 我的 Bug”两个固定场景，而是按下面顺序处理：

1. 先对用户原始文本做归一化，去掉高频语气词、口语前缀和冗余修饰。
2. 优先读取 `agents/modules/intent-routing.yaml` 做高频禅道意图匹配。
3. 如果 YAML 没命中，则读取 `agents/openai.yaml` 中的 `default_prompt`，调用 LLM 做一层禅道意图判定。
4. 如果判定为禅道请求，则路由到对应脚本并尽量抽取常见参数，如 `product`、`project`、`execution`、`testtask`、`story`、`task`、`bug`、`release`。
5. 如果 YAML 和 LLM 都判断为非禅道请求，则返回 `should_fallback_to_general_ai: true`，交给上层普通 AI 处理。

也就是说，“我的任务”“我的 Bug”只是当前已经纳入通用路由的一部分，不再是 callback 内部单独硬编码的唯一能力。

## 常用命令

如果要直接按企业微信用户查询或调试：

```bash
npm run query-my-tasks -- --userid wangwu
```

如果 OpenClaw 已经拿到了原始企业微信回调 JSON，建议直接走统一分发入口：

```bash
npm run wecom-callback -- --data-file examples/callbacks/tmp-callback-task.json
```

也可以传入已经归一化后的回调载荷：

```bash
npm run wecom-callback -- --data-file examples/callbacks/tmp-callback-task.json
```

## 当前代码分层

- `scripts/callbacks/wecom_callback.ts`：只负责回调入口编排，包含 payload 读取、路由选择、脚本执行、formatter 调用。
- `scripts/callbacks/wecom_route_resolver.ts`：维护 YAML 路由加载、关键词匹配、参数提取、缺参判断。
- `scripts/callbacks/wecom_reply_formatter.ts`：维护缺参回复、帮助回复、脚本成功/失败回复。

## 后续维护建议

- 新增或调整关键词、裸数字补全、参数抽取：改 `wecom_route_resolver.ts`。
- 新增或调整回复文案：改 `wecom_reply_formatter.ts`。
- 新增业务能力：优先新增/修改对应 `query-*` 或 `action-*` 脚本，再通过 `intent-routing.yaml` 接入。
- `wecom_callback.ts` 尽量保持薄，不再继续堆业务特判。
## 支持的回调字段

当前可识别的常见字段包括：

- `userid`
- `userId`
- `FromUserName`
- `fromUser`
- `sender.userid`
- `content`
- `text`
- `body.content`

## 当前意图路由来源

高频禅道意图统一来自：

- `agents/modules/intent-routing.yaml`

例如目前已接入的典型意图包括但不限于：

- 查询我的任务
- 查询我的 Bug
- 查询执行 / 迭代是否可提测
- 查询测试单、发布、验收、关闭准备度
- 创建 Bug
- 其他已在 `intent-routing.yaml` 中定义并映射到脚本执行器的能力

说明：

- 不建议继续在 callback 里单独追加“关键词特判分支”。
- 新禅道能力应优先补到 `intent-routing.yaml`。
- 如果自然话术较多、YAML 不适合无限扩写，则由 LLM 判定层兜底。

## 配置说明

禅道固定机器人账号配置应放在：

- `/root/.openclaw/private/zentao.config.json`

如果同时配置了企业微信相关字段，回调脚本可以：

1. 根据回调发送人的 `userid` 查询企业微信目录用户。
2. 将该用户同步或匹配到禅道用户。
3. 按映射后的禅道用户身份执行查询或动作。
4. 返回 `reply_text`，供企业微信侧直接回复。

如果企业微信 `userid` 和真实禅道 `account` 不一致，应优先补齐数据库映射；如果映射失败，则提示用户手动提供工号或禅道账号。

## 示例回调文件

仓库中的回调样例文件位于：

- `examples/callbacks/tmp-callback-task.json`
- `examples/callbacks/tmp-callback-help.json`

在仓库根目录执行命令时，直接使用这些相对路径即可。

## Web 路由补充

历史 HAR 排查确认，Biz 11.5 Web 端“指派给我”的任务入口为：

```text
/my-work-task-assignedTo.html
```

当前该路由已记录在 `web_routes.my_task_assigned` 中，后续若 REST API 与实际部署不一致，可作为 Web 模式兜底入口。

## 输出结果

脚本输出 JSON，常见字段包括：

- `matched_user`
- `sync_result`
- `status_counts`
- `tasks`
- `reply_text`
- `should_fallback_to_general_ai`
- `intent`
- `script`
