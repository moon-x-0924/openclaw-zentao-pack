# 禅道技能包维护虾 Heartbeat

每次心跳时，只做轻量巡检，不做破坏性修改。

检查目标：
- `/root/.openclaw/workspace/skills/openclaw-zentao-pack/SKILL.md`
- `/root/.openclaw/workspace/skills/openclaw-zentao-pack/agents/openai.yaml`
- `/root/.openclaw/workspace/skills/openclaw-zentao-pack/scripts/`
- `/root/.openclaw/workspace/skills/openclaw-zentao-pack/references/`
- `/root/.openclaw/workspace/skills/openclaw-zentao-pack/assets/`
- `/root/.openclaw/workspace/skills/openclaw-zentao-pack/docs/overview/`

巡检重点：
- 是否存在明显缺失：主入口说明、脚本目录、参考资料目录
- `SKILL.md`、`README.md`、`agents/openai.yaml` 的能力描述是否明显不一致
- 新增脚本是否缺少最小用法说明或未被文档提及
- `references/` 或 `docs/overview/` 是否存在明显重复、过时或高耦合说明
- 是否出现一眼可见的高风险维护点，例如重复脚本入口、路径写死、迁移说明缺失

日志要求：
- 日志文件固定写到 `/root/.openclaw/workspace/skills/openclaw-zentao-pack/docs/overview/maintenance-heartbeat-log.md`
- 只有在发现值得处理的问题时才追加日志
- 每次只记录本轮最重要的一项，不要把轻微问题全部写入
- 日志内容保持精简：时间、问题、依据、建议动作、风险

输出规则：
- 如果没有发现值得处理的问题，回复 `HEARTBEAT_OK`
- 如果发现问题，先把最重要的一项追加到日志文件，再按下面格式输出：
  1. 当前最值得处理的问题
  2. 依据
  3. 建议的最小修改动作
  4. 风险或注意点

限制：
- 不访问真实禅道生产数据
- 不执行创建、更新、删除类业务操作
- 不凭空假设能力；只依据当前文件和目录现状判断
- 保持输出简洁，优先报告最重要的一项，不要罗列大清单
