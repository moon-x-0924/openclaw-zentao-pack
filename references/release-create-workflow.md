# 发布创建工作流

## 查询入口

- `release-browse-{product}-all.json`
- `release-view-{id}.json`

## 创建入口

- `release-create-{product}.html`

## 表单字段

- `name`
- `marker`
- `sync`
- `status`
- `date`
- `releasedDate`
- `desc`
- `uid`

## 注意事项

- 创建前建议先查询已有发布，避免重复创建。
- 返回结果中的 `releases` 列表可用于快速确认新发布是否写入成功。
- 如果创建后还要关联需求或 Bug，通常需要继续执行发布关联流程。
