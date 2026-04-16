# SOP 问题记录提示词

这个文件专门存放“让 Codex 先记录问题、暂不修复”的常用提示词。

适用场景：

- 已经知道现场现象，先归档，后面再修
- Codex 已经分析出可能原因，但你现在没时间继续修
- 你上传了截图，希望 Codex 把原因分析和图片说明一起写进 SOP
- 你已经把截图归档到本地路径，希望记录里能直接预览图片

相关文件：

- 问题清单：`docs/ops/sop问题记录/测试问题SOP清单.md`
- 截图归档命令：`npm run archive-sop-screenshot`
- 问题记录命令：`npm run log-observed-issue`
- 截图归档目录：`docs/ops/sop问题记录/screenshots/`

## 1. 已经分析完，先记录，不继续修复

```text
基于你刚才已经给出的原因分析，现在先不要继续修复，也不要继续执行复现、联调或排查命令。

请把“本次问题”先整理并记录到 docs/ops/sop问题记录/测试问题SOP清单.md，方便我后续逐项处理。

要求：
1. 直接基于你刚才已经输出的结论整理，不要重复排查。
2. 记录内容至少包括：
   - title
   - expected
   - actual
   - analysis
   - next-action
3. 不要编造新的日志、截图、执行结果。
4. 如果我已经提供截图路径，把截图一并写入问题记录。
   对每张截图都要写清“这张图是什么”，不要只写截图1、截图2。
   如果我只是上传了图片但没给路径，也要把你从图片里看到的关键信息写进问题记录。
   如果我既给了图片又给了路径，默认同时写入 --screenshots 和 --image-notes，这样记录里既能直接预览图片，也能保留图片说明。
5. 不要继续修复，只做记录。
6. 直接执行：
   npm run log-observed-issue -- --title "<title>" --expected "<expected>" --actual "<actual>" --analysis "<analysis>" --next-action "<next-action>" --tags "待修复,问题归档,现场问题"
   如果你已经完成图片说明，再补：
   --image-notes "<图1说明>|<图2说明>"
   如果我提供了截图，再补：
   --screenshots "<截图说明1::截图路径1,截图说明2::截图路径2>"
7. 完成后只回复我：
   - 本次问题摘要
   - 已写入 docs/ops/sop问题记录/测试问题SOP清单.md
   - 建议后续修复优先级
```

## 2. 已知现场现象，先记录，不先复现

```text
你现在先不要执行任何复现命令，也不要主动联调。

请基于我刚才描述的问题，先整理出一条“问题记录”，并立即写入 docs/ops/sop问题记录/测试问题SOP清单.md。

要求：
1. 先把这次问题整理成这几个字段：
   - title
   - expected
   - actual
   - analysis
   - next-action
2. 如果我提供的信息不完整，你可以做最小必要假设，但要写得保守，不要编造执行结果。
3. 如果我已经提供截图路径，把截图一并写入问题记录。
   对每张截图都要写清“这张图是什么”，不要只写截图1、截图2。
   如果我只是上传了图片但没给路径，也要把你从图片里看到的关键信息写进问题记录。
   如果我既给了图片又给了路径，默认同时写入 --screenshots 和 --image-notes，这样记录里既能直接预览图片，也能保留图片说明。
4. 不要先复现，不要先跑命令。
5. 直接执行记录命令，把问题写入 SOP：
   npm run log-observed-issue -- --title "<title>" --expected "<expected>" --actual "<actual>" --analysis "<analysis>" --next-action "<next-action>" --tags "现场问题,待排查"
   如果你已经完成图片说明，再补：
   --image-notes "<图1说明>|<图2说明>"
   如果我提供了截图，再补：
   --screenshots "<截图说明1::截图路径1,截图说明2::截图路径2>"
6. 回复我时只需要告诉我：
   - 你整理后的问题摘要
   - 你已经写入 docs/ops/sop问题记录/测试问题SOP清单.md
   - 建议我下一步是否需要你继续排查
```

## 3. 发图片给 Codex 自动分析并归档

```text
请基于我刚才发的图片和问题描述，直接整理一条完整的问题记录，并写入 docs/ops/sop问题记录/测试问题SOP清单.md。

要求：
1. 不要继续修复，不要继续联调，不要继续跑复现命令。
2. 先基于图片和我刚才提供的上下文，整理出：
   - title
   - expected
   - actual
   - analysis
   - next-action
3. 必须补充“图片说明”：
   - 每张图片分别看到了什么
   - 这些图片支持了什么判断
   - 如果信息不足，要明确写“仅凭图片暂不能确认”
4. 如果我给了图片路径，就同时写入截图路径和图片说明。
   这种情况下优先让记录支持 Markdown 直接预览图片，不要只写图片说明。
5. 如果我没给图片路径，不要编造本地路径，但仍然要把图片说明写进记录。
6. 直接执行：
   npm run log-observed-issue -- --title "<title>" --expected "<expected>" --actual "<actual>" --analysis "<analysis>" --next-action "<next-action>" --image-notes "<图1说明>|<图2说明>" --tags "待修复,问题归档,现场问题"
7. 如果我给了图片路径，再补：
   --screenshots "<截图说明1::截图路径1,截图说明2::截图路径2>"
8. 完成后只回复我：
   - 本次问题摘要
   - 图片说明摘要
   - 已写入 docs/ops/sop问题记录/测试问题SOP清单.md
```

## 4. 本地截图归档后再交给 Codex

```text
我已经把截图归档到本地路径了，请基于我刚才发的图片、问题描述和下面这些路径，整理一条完整的问题记录，并写入 docs/ops/sop问题记录/测试问题SOP清单.md。

截图路径：
- <路径1>
- <路径2>

要求：
1. 不要继续修复，不要继续联调，不要继续跑复现命令。
2. 基于图片和上下文整理：
   - title
   - expected
   - actual
   - analysis
   - next-action
3. 每张图都要补“图片说明”：
   - 这张图看到了什么
   - 这张图支持了什么判断
4. 记录时默认同时写入：
   - --screenshots
   - --image-notes
   这样 Markdown 预览时能直接看到图片，同时保留图片说明。
5. 完成后只回复我：
   - 本次问题摘要
   - 图片说明摘要
   - 已写入 docs/ops/sop问题记录/测试问题SOP清单.md
```

## 5. 只有聊天截图、没有本地路径时的降级模板

```text
请基于我发的截图，整理一条测试问题记录，并写入 docs/ops/sop问题记录/测试问题SOP清单.md。

要求：
1. 只基于截图里能确认的信息整理，不要继续排查，不要继续修复，不要再跑复现或联调命令。
2. 如果信息不足，可以做最小必要假设，但要写得保守，不能编造日志、执行结果或结论。
3. 记录内容至少包含：
   - title
   - expected
   - actual
   - analysis
   - next-action
4. 如果我额外提供了截图路径，把截图路径一并写入问题记录；如果我只上传图片但没给路径，不要编造本地路径。
5. 直接执行：
   npm run log-observed-issue -- --title "<title>" --expected "<expected>" --actual "<actual>" --analysis "<analysis>" --next-action "<next-action>" --tags "待修复,问题归档,现场问题"
6. 完成后只回复我：
   - 本次问题摘要
   - 已写入 docs/ops/sop问题记录/测试问题SOP清单.md
   - 建议后续修复优先级
```

## 6. 最短口语版

```text
把你刚才已经分析出的结论先归档，不要继续修复，不要继续跑命令。请直接整理为问题记录，并写入 docs/ops/sop问题记录/测试问题SOP清单.md。使用 npm run log-observed-issue 完成记录；如果我给了图片路径，默认同时写 screenshots 和 image-notes，让 Markdown 能直接预览图片。
```

## 7. 图片 + 口语描述最短实战版

### 7.1 我有图片路径时，直接发这一段

```text
我先不修，你先帮我把这次问题记到 docs/ops/sop问题记录/测试问题SOP清单.md。

问题现象：
<我口头描述的问题现象>

截图路径：
- <路径1>
- <路径2>

要求：
1. 不要继续修复，不要继续跑复现命令。
2. 直接基于我刚才的描述和图片，整理本次：
   - title
   - expected
   - actual
   - analysis
   - next-action
3. 每张图都要写清：
   - 这张图看到什么
   - 这张图支持什么判断
4. 写入时默认同时使用：
   - --screenshots
   - --image-notes
5. 完成后只回复我：
   - 本次问题摘要
   - 图片说明摘要
   - 已写入 docs/ops/sop问题记录/测试问题SOP清单.md
```

### 7.2 我只有聊天图片、没有本地路径时，直接发这一段

```text
我先不修，你先帮我把这次问题记到 docs/ops/sop问题记录/测试问题SOP清单.md。

我刚才发的图片和这个现象有关：
<我口头描述的问题现象>

要求：
1. 不要继续修复，不要继续跑复现命令。
2. 只基于我刚才的描述和图片里能确认的信息，整理本次：
   - title
   - expected
   - actual
   - analysis
   - next-action
3. 把每张图的关键信息和它支持的判断写进图片说明。
4. 如果仅凭图片不能确认，要明确写“仅凭图片暂不能确认”。
5. 不要编造本地图片路径；没有路径时只写 image-notes。
6. 完成后只回复我：
   - 本次问题摘要
   - 图片说明摘要
   - 已写入 docs/ops/sop问题记录/测试问题SOP清单.md
```

### 7.3 一句话极简版

```text
先别修，基于我刚才的描述和图片把这次问题直接记到 docs/ops/sop问题记录/测试问题SOP清单.md；如果我给了图片路径，就同时写 screenshots 和 image-notes，并把每张图说明白。
```

## 8. 推荐流程

1. 如果你发提示词时手里已经有本地图片文件，先归档到同目录：
   `npm run archive-sop-screenshot -- --source ~/Desktop/xxx.png --name 问题短名`
2. 把归档后的相对路径和提示词一起发给 Codex。
3. 使用“本地截图归档后再交给 Codex”模板。
4. 让 Codex 同时写：
   - `--screenshots`
   - `--image-notes`
5. 如果你只是上传了聊天图片、没有可用本地路径，Codex 仍然可以先分析图片并写 `--image-notes`，但这时不能保证自动保存到本地目录，也不能在 Markdown 中直接预览那张图。

## 9. 关键原则

- 想让 Markdown 直接预览图片，必须提供可访问的本地路径，并使用 `--screenshots`。
- 想保留“这张图说明了什么”，必须补 `--image-notes`。
- 最稳妥的记录方式是：`--screenshots + --image-notes` 一起写。
