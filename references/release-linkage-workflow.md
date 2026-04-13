# 发布关联工作流

## 目的

用于 SOP Step 21 之后将需求和 Bug 关联到指定发布。

## 页面与接口

- 关联需求：`/release-linkStory-{releaseId}.html`
- 关联 Bug：`/release-linkBug-{releaseId}.html`
- 结果校验：`/release-view-{releaseId}.json`

## 提交方式

### 关联需求

- `stories[0]=3`
- `stories[1]=2`

提交时使用数组形式写入 `$_POST['stories']`。

### 关联 Bug

- `bugs[0]=1`
- `bugs[1]=5`

提交时使用数组形式写入 `$_POST['bugs']`。

## 校验要点

- 提交前建议先确认待关联对象确实属于当前发布所属产品。
- 需求关联成功后通常会出现 `linked2release` 标记。
- Bug 关联成功后也会出现 `linked2release` 标记。
- 返回 JSON 中通常可以直接看到 `stories` / `bugs` 的更新结果。

## OpenClaw 示例

- `npm run link-release-items -- --release 3 --story-ids 2,3`
- `npm run link-release-items -- --release 3 --bug-ids 1`
- `npm run link-release-items -- --release 3 --story-ids 2 --bug-ids 1`
