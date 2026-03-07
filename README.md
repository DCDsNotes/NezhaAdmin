# Nezha Admin Frontend

当前版本已改为通过 PocketBase 驱动数据层，并保留原有 React 管理台界面与路由。

## 快速开始

1. 启动 PocketBase，默认地址为 `http://127.0.0.1:8090`
2. 复制 `.env.example` 为 `.env.local`
3. 配置 `VITE_POCKETBASE_URL`
4. 安装依赖并启动前端

```bash
npm install
npm run dev
```

## 兼容策略

- 保留原有 `src/api/*` 与页面结构
- 将 `/api/v1/*` 请求重定向到 `PocketBase` 兼容层
- 通过各业务集合中的 `legacy_id` 保留原本的数值型 ID
- 使用 PocketBase `users` 认证集合承载登录态

## 必要集合

- `users`：认证集合，需额外包含 `legacy_id`、`role`、`agent_secret`、`reject_password`、`oauth2_bind`、`login_ip`
- `app_settings`：单例配置集合
- `frontend_templates`：前端模板元数据
- `servers`、`server_groups`、`server_configs`
- `services`、`notifications`、`notification_groups`
- `crons`、`alert_rules`、`ddns_profiles`、`nats`
- `online_users`、`waf_blocks`

详细字段建议见 `pocketbase/README.md`。

## 当前限制

- 终端 WebSocket 与文件管理 WebSocket 仍需单独网关或 PocketBase hook 支撑
- OAuth2 绑定/跳转尚未接入 PocketBase 前端认证流
- `force-update/server` 目前返回兼容占位结果，不会触发真实探针动作
