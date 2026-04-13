# 执行关联需求工作流

## 目的

用于 SOP Step 11 之后的执行单配置场景，将已有需求批量关联到指定执行。

## 页面与接口

- 关联页面：`/execution-linkStory-{executionId}.html`
- 结果校验：`/execution-story-{executionId}.json`

## 提交方式

### 表单字段

- `stories[0]=2`
- `stories[1]=3`

提交时使用数组形式写入 `$_POST['stories']`。

## 校验要点

- 提交前先确认需求 ID 在当前执行可选范围内。
- 若带 project 上下文，需求通常需要与执行所属项目保持一致。
- 提交成功后可在结果中看到 `linked2execution` 标记。
- 建议提交后再查询一次执行需求列表进行确认。

## OpenClaw 示例

- `npm run link-execution-stories -- --execution 4 --story-ids 2`
- `npm run link-execution-stories -- --execution 4 --story-ids 2,3`
- `npm run query-execution-stories -- --execution 4`
