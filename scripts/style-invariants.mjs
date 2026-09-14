#!/usr/bin/env node
/**
 * Architecture and security invariants for the monitor-style admin interface.
 * This intentionally tests stable contracts rather than individual page decoration.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { extname, join, resolve } from "node:path"

const root = resolve(process.argv[2] ?? process.cwd())
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8")

const css = read("src/index.css")
const rootRoute = read("src/routes/root.tsx")
const header = read("src/components/header.tsx")
const navigation = read("src/components/admin-navigation.tsx")
const navigationModel = read("src/hooks/useAdminNavigation.ts")
const table = read("src/components/ui/table.tsx")
const dataTable = read("src/components/data-table.tsx")
const card = read("src/components/ui/card.tsx")
const button = read("src/components/ui/button.tsx")
const input = read("src/components/ui/input.tsx")
const dialog = read("src/components/ui/dialog.tsx")
const settings = read("src/routes/settings.tsx")
const serverRoute = read("src/routes/server.tsx")
const serverForm = read("src/components/server.tsx")
const api = read("src/api/api.ts")
const oauth = read("src/api/oauth2.ts")
const auth = read("src/hooks/useAuth.tsx")
const login = read("src/routes/login.tsx")
const protectedRoute = read("src/routes/protect.tsx")
const routes = read("src/main.tsx")
const safeRedirect = read("src/lib/safe-redirect.ts")
const profileRoute = read("src/routes/profile.tsx")
const profileForm = read("src/components/profile.tsx")
const userForm = read("src/components/user.tsx")

const results = []
const check = (group, name, condition, detail = "") => {
    results.push({ group, name, condition: Boolean(condition), detail })
}

check(
    "architecture",
    "root uses the shared header, navigation and centered workspace",
    rootRoute.includes("<Header siteName={siteName}") &&
        rootRoute.includes("<AdminNavigation />") &&
        rootRoute.includes('className="admin-layout"') &&
        rootRoute.includes('className="admin-workspace"'),
)
check(
    "architecture",
    "one flat navigation model drives both navigation and page context",
    navigationModel.includes("export function useAdminNavigation()") &&
        navigation.includes("export function AdminNavigation()") &&
        header.includes("useAdminNavigation") &&
        navigationModel.match(/href: "\/dashboard/g)?.length >= 8,
)
check(
    "architecture",
    "desktop shell follows the monitor max-width and compact side navigation",
    /\.admin-topbar__inner\s*\{[\s\S]{0,180}?max-width: 80rem/.test(css) &&
        /\.admin-page\s*\{[\s\S]{0,180}?max-width: 80rem/.test(css) &&
        /\.admin-layout\s*\{[\s\S]{0,180}?display: flex/.test(css) &&
        css.includes("--admin-navigation-width: 11rem") &&
        /\.admin-navigation\s*\{[\s\S]{0,260}?width: var\(--admin-navigation-width\)/.test(css),
)
check(
    "architecture",
    "mobile navigation becomes a compact horizontal rail",
    /@media \(max-width: 48rem\)[\s\S]*?\.admin-layout\s*\{[\s\S]{0,100}?flex-direction: column/.test(
        css,
    ) &&
        /@media \(max-width: 48rem\)[\s\S]*?\.admin-navigation\s*\{[\s\S]{0,220}?overflow-x: auto/.test(
            css,
        ),
)
check(
    "tokens",
    "monitor semantic color and radius tokens exist in both themes",
    css.includes("--radius: 0.625rem") &&
        css.includes("--background:") &&
        css.includes("--foreground:") &&
        css.includes("--ok:") &&
        css.includes("--warn:") &&
        css.includes(".dark {") &&
        css.slice(css.indexOf(".dark {")).includes("--ok:"),
)
check(
    "primitives",
    "cards, inputs and buttons share compact monitor geometry",
    card.includes("gap-6 rounded-xl border bg-card py-6") &&
        input.includes("h-9 w-full min-w-0 rounded-md") &&
        button.includes("rounded-md text-sm font-medium") &&
        button.includes('default: "h-9 px-4 py-2"'),
)
check(
    "primitives",
    "tables use a rounded frame and compact headers and cells",
    table.includes("overflow-hidden rounded-xl border bg-card shadow-sm") &&
        table.includes('"h-10 px-2 text-left') &&
        table.includes('"p-2 align-middle') &&
        table.includes('normalizedLabel === "操作"') &&
        table.includes('label.endsWith("名称")'),
)
check(
    "primitives",
    "dialogs remain centered and bounded to the viewport",
    dialog.includes("max-h-[calc(100dvh-2rem)]") &&
        dialog.includes("max-w-[calc(100%-2rem)]") &&
        dialog.includes('scrollMode?: "contained" | "dialog"'),
)
check(
    "tables",
    "desktop rows share one height while actions remain right aligned",
    css.includes("--admin-table-row-height: 4.5rem") &&
        /tbody tr,[\s\S]{0,80}?tbody td\s*\{[\s\S]{0,100}?height: var\(--admin-table-row-height\)/.test(
            css,
        ) &&
        /\[data-column-id="actions"\]\s*\{[\s\S]{0,80}?text-align: right/.test(css),
)
check(
    "tables",
    "column widths and separate IPv4/IPv6 lines are retained",
    dataTable.includes("columnWidths?: Readonly<Record<string, string>>") &&
        dataTable.includes("<col key={column.id}") &&
        serverRoute.includes("columnWidths={SERVER_COLUMN_WIDTHS}") &&
        serverRoute.includes("data-server-ip-list") &&
        serverRoute.includes("addresses.map((address)"),
)
check(
    "tables",
    "mobile rows become cards without a horizontal scrollbar",
    /@media \(max-width: 48rem\)[\s\S]*?\[data-slot="table-scroll"\]\s*\{[\s\S]{0,100}?overflow: visible/.test(
        css,
    ) &&
        /@media \(max-width: 48rem\)[\s\S]*?tbody tr\s*\{[\s\S]{0,180}?display: grid/.test(css) &&
        css.includes("td[data-table-actions]") &&
        css.includes("td[data-table-select]"),
)
check(
    "settings",
    "settings are grouped into reusable card and grid sections",
    settings.match(/data-settings-section/g)?.length === 10 &&
        settings.match(/data-settings-grid/g)?.length === 5 &&
        settings.includes("data-settings-footer") &&
        css.includes(".admin-content [data-settings-section]") &&
        css.includes(".admin-content [data-settings-grid]"),
)
check(
    "dialogs",
    "server editor uses one contained scroll region",
    serverForm.includes("data-server-dialog") &&
        serverForm.includes("data-server-dialog-scroll") &&
        serverForm.includes('scrollMode="contained"') &&
        dialog.includes(': "overflow-hidden"'),
)
check(
    "quality",
    "obsolete glass-sidebar architecture is absent",
    !css.includes("admin-sidebar") &&
        !css.includes("backdrop-filter") &&
        !css.includes("stage-in") &&
        !css.includes("--radius-control"),
)

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
const pixelUnitFiles = sourceFiles.filter((file) => /(?<![A-Za-z])(?:\d*\.?\d+)px/.test(read(file)))
check(
    "quality",
    "source uses rem-based numeric units",
    pixelUnitFiles.length === 0,
    pixelUnitFiles.join(", "),
)
check(
    "quality",
    "all standard admin routes opt into the shared page contract",
    [
        "server",
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
    ].every((page) => {
        const relativePath = `src/routes/${page}.tsx`
        return (
            existsSync(join(root, relativePath)) && read(relativePath).includes("data-admin-page")
        )
    }),
)
check(
    "auth",
    "expired sessions clear state and replace the route with login",
    api.includes('AUTH_EXPIRED_EVENT = "nezha:auth-expired"') &&
        api.includes("response.status === 401") &&
        auth.includes("setProfile(undefined)") &&
        auth.includes('navigate("/dashboard/login", { replace: true })'),
)
check(
    "auth",
    "login starts empty and protected routes have explicit pending states",
    login.includes('username: ""') &&
        login.includes('password: ""') &&
        routes.match(/<AuthProvider>/g)?.length === 1 &&
        routes.includes("<GuestRoute>") &&
        protectedRoute.includes('status === "checking"'),
)
check(
    "security",
    "session and OAuth boundaries retain CSRF and safe redirects",
    api.includes('headers["X-CSRF-Token"] = csrfToken') &&
        api.includes('readCookie("nz-jwt")') &&
        oauth.match(/encodeURIComponent\(provider\)/g)?.length === 2 &&
        login.includes("getSafeHttpRedirect") &&
        profileRoute.includes("getSafeHttpRedirect") &&
        safeRedirect.includes('url.protocol !== "https:"') &&
        safeRedirect.includes('url.protocol !== "http:"') &&
        profileForm.match(/type="password"/g)?.length === 2 &&
        /name="username"[\s\S]{0,500}?autoComplete="username"/.test(userForm),
)

let failed = 0
for (const result of results) {
    if (!result.condition) failed += 1
    const detail = result.condition || !result.detail ? "" : ` — ${result.detail}`
    console.log(`${result.condition ? "PASS" : "FAIL"}  [${result.group}] ${result.name}${detail}`)
}

console.log(
    `\n${results.length - failed}/${results.length} invariants passed${failed ? `; ${failed} failed` : ""}.`,
)
process.exit(failed ? 1 : 0)
