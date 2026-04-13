# 需求关闭与激活工作流

## 页面入口

- `story-close-{id}.html`
- `story-activate-{id}.html`

## 关键字段

### close

- `closedReason`
- `comment`
- `uid`
- `module`
- `plan`

### activate

- `assignedTo`
- `comment`
- `uid`
- `module`
- `plan`

## 注意事项

- `story-close` 成功后需求状态会变为 `closed`。
- `story-activate` 成功后需求状态会重新变为 `active`。
- 关闭原因通常使用 `done` 表示已完成关闭。
