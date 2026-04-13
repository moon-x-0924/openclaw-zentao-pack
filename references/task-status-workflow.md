# 任务状态流转工作流

## 目的

用于任务推进过程中的状态更新，当前优先通过 ZenTao Web 表单而不是 REST 接口完成。

## 支持状态

- `doing`
- `done`
- `activate`
- `pause`
- `closed`

## 关键字段说明

`scripts/actions/update_task_status.ts` 当前主要处理以下字段：

- `taskId`
- `status`
- `comment`
- `consumedHours`
- `leftHours`
- `finishedDate`
- `assignedTo`

## 提交要点

- `doing` 通常需要填写已消耗工时和剩余工时。
- `done` 场景通常要求填写已消耗工时。
- `activate` 常用于重新打开已完成或已暂停任务。

## 注意事项

- `done` 成功后任务通常会进入已完成状态。
- 当前实现不是直接走 REST，而是先取 HTML 表单后按页面规则提交。
- 若页面要求其他字段，提交时也需要一并补齐。
