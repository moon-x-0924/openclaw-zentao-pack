# Bug 状态流转

## 页面入口

当前通过禅道 Bug 状态页面完成状态更新，主要依赖以下 Web 表单：

- `bug-resolve-{id}.html`
- `bug-close-{id}.html`
- `bug-activate-{id}.html`

## 关键字段

### resolve

- `resolution`
- `resolvedBuild`
- `assignedTo`
- `comment`
- `uid`

### close

- `comment`
- `uid`

### activate

- `openedBuild[]`
- `status`
- `comment`
- `uid`
- `assignedTo`

## 注意事项

- `resolve` 场景必须填写 `resolution`。
- `activate` 场景通常要补 `openedBuild[]`，并与 `resolvedBuild` 保持一致。
- 成功后通常会返回类似 `{"result":"success","message":"保存成功"}` 的结果。
