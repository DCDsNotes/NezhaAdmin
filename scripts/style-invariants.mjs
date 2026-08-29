#!/usr/bin/env node
/**
 * style-invariants.mjs — CDT-Monitor 风格落地断言（零依赖纯 Node）。
 *
 * 每个断言组对应 ROADMAP.md 的 RM-1..RM-9：
 *  - RM-1 令牌层：语义令牌在 :root 与 .dark 成对存在
 *  - RM-2 布局层：结构保留（216px/82px）+ 顶栏/外壳毛玻璃升级
 *  - RM-3 内容基元：卡片/表格玻璃化 + 控件圆角 12px
 *  - RM-4 共享组件：墨色 primary、eyebrow 页头
 *  - RM-5 dashboard：stage-in 入场动画落地
 *  - RM-6..RM-9：页面入口存在 + 登录页 auth 玻璃卡
 *
 * 用法：node scripts/style-invariants.mjs [repoRoot]
 * 退出码：0 = 全部通过；1 = 存在失败断言。
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? process.cwd());
const read = (rel) => readFileSync(join(root, rel), "utf8");

const css = read("src/index.css");
const header = read("src/components/table-page-header.tsx");

const results = [];
const check = (group, name, ok, detail = "") => {
    results.push({ group, name, ok, detail });
};

// ---------- RM-1 令牌层 ----------
const TOKENS_LIGHT = [
    "--ink", "--muted", "--glass-card", "--glass-card-border", "--glass-highlight",
    "--card-shadow", "--card-shadow-sm", "--radius-card", "--radius-auth", "--radius-control",
    "--ease-out", "--dur-in",
    "--green", "--green-soft", "--blue", "--blue-soft", "--cyan", "--cyan-soft",
    "--red", "--amber", "--amber-soft",
];
const TOKENS_DARK = [
    "--ink", "--muted", "--glass-card", "--glass-card-border", "--glass-highlight",
    "--card-shadow", "--card-shadow-sm",
    "--green", "--green-soft", "--blue", "--blue-soft", "--cyan", "--cyan-soft",
    "--red", "--amber", "--amber-soft",
];
const rootBlock = css.slice(0, css.indexOf(".dark {"));
const darkBlock = css.slice(css.indexOf(".dark {"));

for (const token of TOKENS_LIGHT) {
    check("RM-1 令牌(浅色)", token, rootBlock.includes(`${token}:`), "缺失于 :root");
}
for (const token of TOKENS_DARK) {
    check("RM-1 令牌(.dark)", token, darkBlock.includes(`${token}:`), "缺失于 .dark");
}

// ---------- RM-2 布局层 ----------
check("RM-2 布局", "侧栏宽度保留 216px", css.includes("--admin-sidebar-width: 216px"));
check("RM-2 布局", "顶栏高度保留 82px", css.includes("--admin-topbar-height: 82px"));
check("RM-2 布局", "外壳浅色背景 #f1f3f5", css.includes("background: #f1f3f5"));
check("RM-2 布局", "顶栏毛玻璃 blur(22px)", /\.admin-topbar\b[\s\S]{0,900}?backdrop-filter: blur\(22px\)/.test(css));
check("RM-2 布局", "侧栏毛玻璃", /\.admin-sidebar\b[\s\S]{0,900}?backdrop-filter: blur\(/.test(css));

// ---------- RM-3 内容基元 ----------
check("RM-3 基元", "卡片玻璃(blur 22px)", /\[data-slot="card"\]\s*\{[\s\S]{0,700}?backdrop-filter: blur\(22px\)/.test(css));
check("RM-3 基元", "卡片圆角 24px 令牌", /\[data-slot="card"\]\s*\{[\s\S]{0,700}?var\(--radius-card\)/.test(css));
check("RM-3 基元", "卡片柔和深投影", /\[data-slot="card"\]\s*\{[\s\S]{0,700}?var\(--card-shadow\)/.test(css));
check("RM-3 基元", "表格容器玻璃", /\[data-slot="table-frame"\]\s*\{[\s\S]{0,700}?blur\(22px\)/.test(css));
check("RM-3 基元", "控件圆角 12px", css.includes("--admin-control-radius: 12px"));
check("RM-3 基元", "表格透明底", /\.admin-content table\s*\{[\s\S]{0,200}?background: transparent/.test(css));

// ---------- RM-4 共享组件 ----------
check("RM-4 组件", "浅色主按钮墨色 #181a1d", /:root\s*\{[\s\S]{0,900}?--primary: #181a1d/.test(css));
check("RM-4 组件", "页头 eyebrow 标签", header.includes("font-extrabold") && header.includes("Navigation.ControlCenter"));

// ---------- RM-5 dashboard ----------
check("RM-5 页面", "stage-in 动画 keyframes", css.includes("@keyframes stage-in"));
check("RM-5 页面", "卡片 stage-in 入场", /\[data-slot="card"\]\s*\{[\s\S]{0,700}?animation: stage-in/.test(css));

// ---------- RM-6..RM-9 页面入口与登录 ----------
for (const page of [
    "service", "cron", "ddns", "nat", "notification", "notification-group",
    "server-group", "alert-rule", "online-user", "user", "waf", "profile", "settings",
]) {
    check("RM-6..8 页面", `route/${page}.tsx 存在`, existsSync(join(root, `src/routes/${page}.tsx`)));
}
check("RM-9 登录", "登录卡 auth 玻璃(28px)", /\.admin-login\b[\s\S]{0,900}?var\(--radius-auth\)/.test(css));

// ---------- 汇总 ----------
let failed = 0;
for (const r of results) {
    if (!r.ok) failed += 1;
    console.log(`${r.ok ? "PASS" : "FAIL"}  [${r.group}] ${r.name}${r.ok ? "" : ` — ${r.detail}`}`);
}
console.log(`\n${results.length - failed}/${results.length} 断言通过${failed ? `，${failed} 个失败` : ""}`);
process.exit(failed ? 1 : 0);
