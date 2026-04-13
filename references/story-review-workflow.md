# 需求创建与评审工作流

## 创建入口

- `story-create-{product}-0-0-0-0-0-0-0.html`

## 查询入口

- `story-browse-{product}-all-0-id_desc-0-100-1.json`
- `my-work-story-assignedTo.json`
- `story-view-{id}.json`

## 评审入口

- `story-review-{id}.html`

## 创建字段

- `product`
- `module`
- `reviewer[]`
- `assignedTo`
- `category`
- `title`
- `pri`
- `estimate`
- `spec`
- `verify`
- `uid`
- `needNotReview`
- `type`
- `status`
- `keywords`

## 评审字段

- `result`
- `assignedTo`
- `pri`
- `estimate`
- `status`
- `comment`
- `uid`
- `module`
- `plan`
- `closedReason`

## 注意事项

- 创建时若填写 `reviewer[]`，需求通常会进入 `reviewing` 状态。
- `result=pass` 后需求通常会转为 `active`。
- 评审结果一般使用 `pass`、`clarify`、`reject`。
