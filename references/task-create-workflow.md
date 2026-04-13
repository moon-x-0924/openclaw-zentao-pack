# 执行任务创建工作流

## 目的

用于 SOP Step 12 之后在执行下创建任务，并回查任务列表与任务详情。

## 页面与接口

- 创建页面：`/task-create-{execution}-{story}-{module}-{parent}-{todo}-{bug}.html`
- 详情校验：`/task-view-{taskId}.json`
- 列表校验：`/execution-task-{executionId}.json`

## 必填字段

- `execution`
- `type`
- `name`
- `uid`

## 常用字段

- `story`
- `module`
- `assignedTo`
- `pri`
- `estimate`
- `desc`
- `status=wait`
- `after=toTaskList`

## OpenClaw 示例

- `npm run create-task -- --execution 4 --story 2 --name "登录页开发-阶段2" --assigned-to admin --pri 3 --estimate 4`
- `npm run query-execution-tasks -- --execution 4`
- `npm run query-task-detail -- --task 1`
