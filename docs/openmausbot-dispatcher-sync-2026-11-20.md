# OpenMausBot ↔ Task OS 同步记录（2026-11-20）

## 总调度与驾驶舱

- **设计说明（全文）**：`docs/command-center-design.md`（与附件 `roleandaction.md` 同源）
- **数据真源**：`data/command-center.json`（驾驶舱）、总调度 OpenMausBot **总调度**（`afe2ac3d-ba69-4567-aad8-5d8eb798617b`）
- **原则**：专业 Bot 交付证据；总调度只读结构化结果并写入 `action_queue` / `coordinate`；个人聚焦（`business-function-board`）本次未建 bot

## 本轮 OpenMausBot 新建（work 链补齐）

| Task OS 职能名 | OpenMausBot | bot_id | 备注 |
| --- | --- | --- | --- |
| dispatch·总调度 | 总调度 | afe2ac3d-ba69-4567-aad8-5d8eb798617b | 新建 |
| work·工作问题收集器 | work·工作问题收集器 | e55d7b04-484d-4b2f-809e-26acb7f09ef7 | 新建 |
| work·技术评审者 | work·技术评审者 | 83eee851-4e32-4b3b-a6b8-9b1448e24e9a | 新建 |
| work·技术学习教练 | work·技术学习教练 | dc3694b6-46e5-4e22-8e63-21cbc16c7f9f | 新建 |

## 既有 bot 兼任（未改 OpenMausBot 配置）

| Task OS 职能名 | OpenMausBot | bot_id |
| --- | --- | --- |
| work·技术研究员 | 技逆向 | eabac058-364b-475a-bdcf-fff9a5c2e0d2 |
| work·项目分析师 | 产品设计 | 1ad0da16-7a04-4e3d-b109-94a22ee7c9bc |
| work·工程实践顾问 | 编码部署 | dc4a4ecb-a50e-4163-814b-f24e2d01128d |
| grow·市场情报 | 源雷达 | 49aa248d-4b1a-4b08-9366-3beb62600fa9 |

## grow· 七角色（2026-11-20 第二批）

| 职能 | OpenMausBot | bot_id | 状态 |
| --- | --- | --- | --- |
| grow·市场情报 | 源雷达 | 49aa248d-4b1a-4b08-9366-3beb62600fa9 | 兼任 active |
| grow·用户研究 | grow·用户研究 | 60364a5b-5234-4016-8409-d7684bff942e | 新建 |
| grow·运营策略 | grow·运营策略 | 520cc044-7cd8-4808-988e-1b9ccdd075fd | 新建 |
| grow·内容策划 | grow·内容策划 | 2ddcba47-01d6-4aca-8359-3941a064b74e | 新建 |
| grow·内容创作 | grow·内容创作 | ca3bf900-9da0-4654-8eb5-51fef593dffd | 新建 |
| grow·渠道社区 | 源雷达 | 49aa248d-4b1a-4b08-9366-3beb62600fa9 | proxy，待下轮独立 bot |
| grow·数据优化 | 交易观察员 | f3b28263-e68d-4a85-ad32-dadaf8b23196 | proxy，待下轮独立 bot |

## 如何再同步

```bash
node scripts/sync-openmausbot-bindings.mjs
```

会更新 `data/*.json` 的 `meta.openmausbot_bindings`、`duties[].agent`、各 `roles[].openmausbot`，并刷新 `command-center` 的 `dispatcher_bot_id`。

镜像目录（本机 OpenMausBot workspace）：

- `C:\Users\eason\.openmausbot\workspaces\9e834061-15eb-43eb-b9f2-911161e85c22\dispatch-command-center\`
- `...\work-skills-board\`
- `...\grow-operations-board\`