# 发布状态流转

## 编辑入口

- `release-edit-{id}.html`

## 表单字段

- `system`
- `name`
- `marker`
- `status`
- `date`
- `releasedDate`
- `desc`
- `uid`
- `product`

## 注意事项

- `system` 字段通常决定是否允许作为系统默认发布展示。
- 常见状态切换包括 `release #2` 这类记录的：
  - `normal -> terminate`
  - `terminate -> normal`
- 更新状态时通常需要保持原有 `system` 等字段一并回填。
