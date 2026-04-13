# 团队成员设置工作流

## 查询入口

- `project-view-{id}.json`
- `execution-view-{id}.json`

## 配置入口

- `project-manageMembers-{id}.html`
- `execution-manageMembers-{id}.html`

## 表单字段

- `account[index]`
- `role[index]`
- `days[index]`
- `hours[index]`
- `limited[index]`
- `removeExecution`

## 注意事项

- `project-manageMembers` 提交前建议先通过 `project-view` 获取现有成员。
- 批量提交时需要保证索引位置一一对应，避免角色和工时错位。
- 若要从执行中移除继承成员，通常需要结合 `removeExecution` 一并处理。
