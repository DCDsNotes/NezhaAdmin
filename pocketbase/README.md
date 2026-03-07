# PocketBase Collections Guide

本项目通过前端兼容层把旧的 `/api/v1/*` 调用映射到 PocketBase 集合。

## 设计原则

- 所有原来依赖数值型 `id` 的业务集合，都应新增唯一数值字段 `legacy_id`
- 兼容层会把 `legacy_id` 映射回前端模型中的 `id`
- 除 `users` 外，建议业务集合均开放给已登录管理员读写
- `app_settings` 建议只有 1 条记录

## 推荐集合

### `users`（认证集合）

必备字段：

- `legacy_id`：number，唯一
- `role`：number，`0` 为管理员
- `agent_secret`：text
- `reject_password`：bool
- `oauth2_bind`：json
- `login_ip`：text

### `app_settings`

建议字段直接对齐前端 `ModelSetting`：

- `site_name`
- `language`
- `cover`
- `tls`
- `oauth2_providers`
- `custom_code`
- `custom_code_dashboard`
- `user_template`
- `install_host`
- `dns_servers`
- `web_real_ip_header`
- `agent_real_ip_header`
- `enable_ip_change_notification`
- `enable_plain_ip_in_notification`
- `ignored_ip_notification`
- `ignored_ip_notification_server_ids`
- `ip_change_notification_group_id`

### `frontend_templates`

- `name`
- `path`
- `author`
- `repository`
- `version`
- `is_admin`
- `is_official`

### 业务集合

以下集合建议字段尽量与现有 `src/types/api.ts` 中的模型保持一致，并统一补充：

- `legacy_id`：number，唯一
- `created_at`：datetime 或 text
- `updated_at`：datetime 或 text

集合列表：

- `servers`
- `server_groups`
- `server_configs`
- `services`
- `notifications`
- `notification_groups`
- `crons`
- `alert_rules`
- `ddns_profiles`
- `nats`
- `online_users`
- `waf_blocks`

## 特殊映射

- `server_groups.servers`：存储服务器 `legacy_id[]`
- `notification_groups.notifications`：存储通知器 `legacy_id[]`
- `server_configs.server_legacy_id`：关联 `servers.legacy_id`
- `waf_blocks.ip`：用作封禁记录唯一键

## 未完成能力

- 终端与文件管理仍需要额外的 WebSocket 服务
- OAuth2 登录建议后续直接改登录页，调用 PocketBase OAuth2 SDK
- 探针下发、文件操作、远程命令执行不适合仅靠前端兼容层完成
