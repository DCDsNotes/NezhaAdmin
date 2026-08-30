#!/usr/bin/env node
/**
 * style-invariants.mjs — CDT-Monitor 风格落地断言（零依赖纯 Node）。
 *
 * 每个断言组对应 ROADMAP.md 的 RM-1..RM-9：
 *  - RM-1 令牌层：语义令牌在 :root 与 .dark 成对存在
 *  - RM-2 布局层：结构保留（13.5rem/5.125rem）+ 顶栏/外壳毛玻璃升级
 *  - RM-3 内容基元：卡片/表格玻璃化 + 控件圆角 0.75rem
 *  - RM-4 共享组件：墨色 primary、eyebrow 页头
 *  - RM-5 dashboard：stage-in 入场动画落地
 *  - RM-6..RM-9：页面入口存在 + 登录页 auth 玻璃卡
 *
 * 用法：node scripts/style-invariants.mjs [repoRoot]
 * 退出码：0 = 全部通过；1 = 存在失败断言。
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { extname, join, resolve } from "node:path"

const root = resolve(process.argv[2] ?? process.cwd())
const read = (rel) => readFileSync(join(root, rel), "utf8")

const css = read("src/index.css")
const header = read("src/components/table-page-header.tsx")
const table = read("src/components/ui/table.tsx")
const tabs = read("src/components/ui/tabs.tsx")
const settings = read("src/routes/settings.tsx")
const rootRoute = read("src/routes/root.tsx")
const adminHeader = read("src/components/header.tsx")
const siteName = read("src/lib/site-name.ts")
const indexHtml = read("index.html")
const formPrimitives = ["button.tsx", "input.tsx", "textarea.tsx", "select.tsx"].map((file) =>
    read(`src/components/ui/${file}`),
)

const results = []
const check = (group, name, ok, detail = "") => {
    results.push({ group, name, ok, detail })
}

check(
    "RM-3 controls",
    "shared inputs and buttons use the 0.75rem control-radius token",
    formPrimitives.every((source) => source.includes("rounded-[var(--radius-control)]")),
)
check(
    "RM-3 settings",
    "settings sections use the 0.9375rem section radius",
    /\[data-settings-section\]\s*\{[\s\S]{0,180}?border-radius: 0\.9375rem/.test(css) &&
        settings.match(/data-settings-control-row/g)?.length === 2 &&
        /\[data-settings-grid\] > \[data-settings-control-row\]\s*\{[\s\S]{0,120}?min-height: 2\.75rem;[\s\S]{0,80}?align-self: end/.test(
            css,
        ),
)
check(
    "RM-5A mobile table",
    "mobile table selection uses a cool-gray action shell and compact checkbox",
    /tr\[data-table-has-actions\] td\[data-table-select\]\s*\{[\s\S]{0,500}?background: #eef2f5/.test(
        css,
    ) &&
        /tr\[data-table-has-actions\] td\[data-table-select\]\s*\{[\s\S]{0,120}?bottom: 1\.4375rem/.test(
            css,
        ) &&
        /td\[data-table-select\] button\[role="checkbox"\]\s*\{[\s\S]{0,300}?width: 1\.125rem/.test(
            css,
        ) &&
        /button\[role="checkbox"\]\[data-state="checked"\]\s*\{[\s\S]{0,180}?background: #181a1d/.test(
            css,
        ),
)
check(
    "RM-5A mobile table",
    "mobile action buttons stay right-aligned opposite the selection control",
    /td\[data-table-actions\] > \*\s*\{[\s\S]{0,180}?width: fit-content;[\s\S]{0,100}?margin-left: auto;/.test(
        css,
    ),
)
check(
    "RM-2 branding",
    "document title and admin brand share the configured site-name fallback",
    siteName.includes('DEFAULT_SITE_NAME = "节点监控"') &&
        siteName.includes("siteName?.trim() || DEFAULT_SITE_NAME") &&
        rootRoute.includes("const siteName = resolveSiteName(settingData?.config?.site_name)") &&
        rootRoute.includes("document.title = siteName") &&
        rootRoute.includes("siteName={siteName}") &&
        adminHeader.includes("<strong>{siteName}</strong>") &&
        indexHtml.includes("<title>节点监控</title>"),
)

// ---------- RM-1 令牌层 ----------
const TOKENS_LIGHT = [
    "--ink",
    "--muted",
    "--glass-card",
    "--glass-card-border",
    "--glass-highlight",
    "--card-shadow",
    "--card-shadow-sm",
    "--radius-card",
    "--radius-auth",
    "--radius-control",
    "--ease-out",
    "--dur-in",
    "--green",
    "--green-soft",
    "--blue",
    "--blue-soft",
    "--cyan",
    "--cyan-soft",
    "--red",
    "--amber",
    "--amber-soft",
]
const TOKENS_DARK = [
    "--ink",
    "--muted",
    "--glass-card",
    "--glass-card-border",
    "--glass-highlight",
    "--card-shadow",
    "--card-shadow-sm",
    "--green",
    "--green-soft",
    "--blue",
    "--blue-soft",
    "--cyan",
    "--cyan-soft",
    "--red",
    "--amber",
    "--amber-soft",
]
const rootBlock = css.slice(0, css.indexOf(".dark {"))
const darkBlock = css.slice(css.indexOf(".dark {"))

for (const token of TOKENS_LIGHT) {
    check("RM-1 令牌(浅色)", token, rootBlock.includes(`${token}:`), "缺失于 :root")
}
for (const token of TOKENS_DARK) {
    check("RM-1 令牌(.dark)", token, darkBlock.includes(`${token}:`), "缺失于 .dark")
}

// ---------- RM-2 布局层 ----------
check("RM-2 布局", "侧栏宽度保留 13.5rem", css.includes("--admin-sidebar-width: 13.5rem"))
check("RM-2 布局", "顶栏高度保留 5.125rem", css.includes("--admin-topbar-height: 5.125rem"))
check("RM-2 布局", "外壳浅色背景 #f5f7f9", css.includes("background: #f5f7f9"))
check(
    "RM-2 布局",
    "顶栏实色背景",
    /\.admin-topbar\s*\{[\s\S]{0,900}?background: #fff/.test(css) &&
        !/\.admin-topbar\s*\{[\s\S]{0,900}?backdrop-filter/.test(css),
)
check(
    "RM-2 布局",
    "侧栏实色背景",
    /\.admin-sidebar\s*\{[\s\S]{0,500}?background: #fff/.test(css) &&
        !/\.admin-sidebar\s*\{[\s\S]{0,500}?backdrop-filter/.test(css),
)

// ---------- RM-3 内容基元 ----------
check(
    "RM-3 基元",
    "卡片玻璃(blur 1.375rem)",
    /\[data-slot="card"\]\s*\{[\s\S]{0,700}?backdrop-filter: blur\(1.375rem\)/.test(css),
)
check(
    "RM-3 基元",
    "卡片圆角 1.5rem 令牌",
    /\[data-slot="card"\]\s*\{[\s\S]{0,700}?var\(--radius-card\)/.test(css),
)
check(
    "RM-3 基元",
    "卡片柔和深投影",
    /\[data-slot="card"\]\s*\{[\s\S]{0,700}?var\(--card-shadow\)/.test(css),
)
check(
    "RM-3 基元",
    "表格容器玻璃",
    /\[data-slot="table-frame"\]\s*\{[\s\S]{0,700}?blur\(1.375rem\)/.test(css),
)
check("RM-3 基元", "控件圆角 0.75rem", css.includes("--admin-control-radius: 0.75rem"))
check(
    "RM-3 基元",
    "列表表格圆角 0.9375rem",
    table.includes("rounded-[0.9375rem]") &&
        /\[data-slot="table-frame"\]\s*\{[\s\S]{0,250}?border-radius: 0\.9375rem/.test(css),
)
check(
    "RM-3 基元",
    "Tab 圆角 0.75rem",
    tabs.match(/rounded-\[0\.75rem\]/g)?.length === 2 &&
        /\[role="tablist"\][\s\S]{0,180}?border-radius: 0\.75rem/.test(css) &&
        /\[role="tab"\][\s\S]{0,180}?border-radius: 0\.75rem/.test(css),
)
check(
    "RM-3 基元",
    "表格透明底",
    /\.admin-content table\s*\{[\s\S]{0,200}?background: transparent/.test(css),
)

// ---------- RM-4 共享组件 ----------
check("RM-4 组件", "浅色主按钮墨色 #181a1d", /:root\s*\{[\s\S]{0,900}?--primary: #181a1d/.test(css))
check(
    "RM-4 组件",
    "页头 eyebrow 标签",
    header.includes("font-extrabold") && header.includes("Navigation.ControlCenter"),
)

// ---------- RM-5 dashboard ----------
check("RM-5 页面", "stage-in 动画 keyframes", css.includes("@keyframes stage-in"))
check(
    "RM-5 页面",
    "卡片 stage-in 入场",
    /\[data-slot="card"\]\s*\{[\s\S]{0,700}?animation: stage-in/.test(css),
)

// ---------- RM-5A 单位、滚动条与响应式表格 ----------
const sourceExtensions = new Set([".css", ".html", ".js", ".jsx", ".mjs", ".ts", ".tsx"])
const sourceFiles = []
const collectSourceFiles = (directory) => {
    for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
        const relativePath = join(directory, entry.name)
        if (entry.isDirectory()) collectSourceFiles(relativePath)
        else if (sourceExtensions.has(extname(entry.name))) sourceFiles.push(relativePath)
    }
}
collectSourceFiles("src")
sourceFiles.push("index.html", "tailwind.config.js", "vite.config.ts")
const numericPixelUnit = /(?<![A-Za-z])(?:\d*\.?\d+)px/
const pixelUnitFiles = sourceFiles.filter((file) => numericPixelUnit.test(read(file)))

check("RM-5A 单位", "源码无数值 px 单位", pixelUnitFiles.length === 0, pixelUnitFiles.join(", "))
check(
    "RM-5A 滚动条",
    "根元素细滚动条与 0.1875rem WebKit 尺寸",
    /html\s*\{[\s\S]{0,220}?scrollbar-color: rgb\(207, 213, 218\) transparent;[\s\S]{0,100}?scrollbar-width: thin/.test(
        css,
    ) &&
        /\*::\-webkit-scrollbar\s*\{[\s\S]{0,120}?width: 0\.1875rem;[\s\S]{0,80}?height: 0\.1875rem/.test(
            css,
        ),
)
check(
    "RM-5A 移动表格",
    "选择框进入操作区并保持首位视觉顺序",
    table.includes("data-table-has-actions") &&
        /tr\[data-table-has-actions\] td\[data-table-select\]/.test(css) &&
        /td\[data-table-actions\][\s\S]{0,260}?padding: 0\.5625rem 0\.6875rem 0\.5625rem 4rem/.test(
            css,
        ),
)
check(
    "RM-5A 设置页",
    "系统设置使用分区化共享布局",
    settings.match(/data-settings-section/g)?.length === 10 &&
        settings.match(/data-settings-grid/g)?.length === 5 &&
        settings.includes("data-settings-footer"),
)

// ---------- RM-6..RM-9 页面入口与登录 ----------
for (const page of [
    "service",
    "cron",
    "ddns",
    "nat",
    "notification",
    "notification-group",
    "server-group",
    "alert-rule",
    "online-user",
    "user",
    "waf",
    "profile",
    "settings",
]) {
    check(
        "RM-6..8 页面",
        `route/${page}.tsx 存在`,
        existsSync(join(root, `src/routes/${page}.tsx`)),
    )
}
check(
    "RM-9 登录",
    "登录卡 auth 玻璃(1.75rem)",
    /\.admin-login\b[\s\S]{0,900}?var\(--radius-auth\)/.test(css),
)

// ---------- 汇总 ----------
let failed = 0
for (const r of results) {
    if (!r.ok) failed += 1
    console.log(`${r.ok ? "PASS" : "FAIL"}  [${r.group}] ${r.name}${r.ok ? "" : ` — ${r.detail}`}`)
}
console.log(
    `\n${results.length - failed}/${results.length} 断言通过${failed ? `，${failed} 个失败` : ""}`,
)
process.exit(failed ? 1 : 0)
