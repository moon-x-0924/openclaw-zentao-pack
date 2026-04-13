# 测试用例创建工作流

## 目的

用于 SOP Step 15 之后创建测试用例，并通过列表和详情结果校验创建成功。

## 页面与接口

- 创建页面：`/testcase-create-{product}-{branch}-{module}-{from}-{param}-{story}.html`
- 详情校验：`/testcase-view-{caseId}.json`
- 列表校验：`/testcase-browse-{product}-{branch}-all-0-id_desc-1-100.json`

## 必填字段

- `product`
- `type`
- `title`
- `steps[]`

## 常用字段

- `branch`
- `module`
- `story`
- `pri`
- `precondition`
- `expects[]`
- `keywords`
- `status=normal`

## OpenClaw 示例

- `npm run create-testcase -- --product 1 --story 2 --title "登录流程校验" --steps "打开登录页||输入正确账号密码||点击登录" --expects "展示登录页||允许输入||成功进入首页"`
- `npm run query-testcases -- --product 1`
