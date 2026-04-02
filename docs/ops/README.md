# 服务器维护 / 日志文档索引

这个目录用于把服务器总变更日志、技能包变更日志、巡检日志、备份清理日志以及维护角色说明统一挂到文档站中，方便直接浏览。

## 推荐查看顺序

1. `服务器总变更日志.md`
2. `技能包变更日志.md`
3. `服务器总变更记录规范.md`
4. `技能包变更记录规范.md`
5. `maintenance-heartbeat-log.md`
6. `backup-cleanup-log.md`
7. `maintainers/README.md`

## 文档说明

- `服务器总变更日志.md`
  - 记录 `/root/.openclaw` 全局层面的重要变更

- `技能包变更日志.md`
  - 记录 `openclaw-zentao-pack` 技能包内部的重要变更

- `服务器总变更记录规范.md`
  - 说明服务器总日志应该如何记录

- `技能包变更记录规范.md`
  - 说明技能包变更日志应该如何记录

- `maintenance-heartbeat-log.md`
  - 维护巡检角色的心跳日志

- `backup-cleanup-log.md`
  - 备份清理角色的执行日志

- `maintainers/README.md`
  - 全局维护角色目录说明

## 维护角色目录

`maintainers/` 下当前挂的是 OpenClaw 全局维护角色的只读文档入口，便于直接查看各类 `HEARTBEAT.md`、`MISSION.md`、`USER.md` 等说明。

## 变更日志分层

- 服务器总变更日志：看整个 `/root/.openclaw` 环境怎么变
- 技能包变更日志：看禅道技能包自身怎么变
- 两份日志都按倒叙显示，最新记录在最前
