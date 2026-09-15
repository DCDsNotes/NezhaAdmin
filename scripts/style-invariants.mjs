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
const tableLayout = read("src/lib/table-layout.ts")
const routeTabs = read("src/components/route-tabs.tsx")
const tabs = read("src/components/ui/tabs.tsx")
const tablePageHeader = read("src/components/table-page-header.tsx")
const settingsTab = read("src/components/settings-tab.tsx")
const notificationTab = read("src/components/notification-tab.tsx")
const groupTab = read("src/components/group-tab.tsx")
const card = read("src/components/ui/card.tsx")
const button = read("src/components/ui/button.tsx")
const input = read("src/components/ui/input.tsx")
const dialog = read("src/components/ui/dialog.tsx")
const settings = read("src/routes/settings.tsx")
const settingsSection = read("src/components/settings-section.tsx")
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

const tableLayouts = [...tableLayout.matchAll(/^    (\w+): \{([\s\S]*?)^    \},/gm)].map(
    ([, name, body]) => ({
        name,
        total: [...body.matchAll(/: "(\d+)%"/g)].reduce(
            (total, [, width]) => total + Number(width),
            0,
        ),
    }),
)

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
    "desktop shell follows the expanded monitor width and compact side navigation",
    css.includes("--admin-page-max-width: 100rem") &&
        /\.admin-topbar__inner\s*\{[\s\S]{0,180}?max-width: var\(--admin-page-max-width\)/.test(
            css,
        ) &&
        /\.admin-page\s*\{[\s\S]{0,180}?max-width: var\(--admin-page-max-width\)/.test(css) &&
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
    "cards, inputs and buttons share compact framework geometry",
    card.includes("gap-6 rounded-lg border bg-card py-6") &&
        input.includes("h-9 w-full min-w-0 rounded-md") &&
        button.includes("rounded-md text-sm font-medium") &&
        button.includes('default: "h-9 px-4 py-2"'),
)
check(
    "primitives",
    "tables use a framework radius and roomier horizontal cells",
    table.includes("overflow-hidden rounded-lg border bg-card shadow-sm") &&
        table.includes('"h-10 px-3 text-left') &&
        table.includes('"px-3 py-2 align-middle') &&
        table.includes('id === "actions"') &&
        table.includes('id === "name"'),
)
check(
    "primitives",
    "dialogs fill mobile viewports and remain bounded on desktop",
    dialog.includes("max-h-dvh w-screen max-w-none") &&
        dialog.includes("sm:max-h-[calc(100dvh-2rem)]") &&
        dialog.includes("sm:left-1/2 sm:top-1/2") &&
        dialog.includes('scrollMode?: "contained" | "dialog"'),
)
check(
    "tables",
    "desktop tables fit the page without horizontal scrolling",
    table.includes('className="relative w-full overflow-x-clip"') &&
        /\[data-slot="table-scroll"\]\s*\{[\s\S]{0,80}?overflow-x: clip/.test(css) &&
        /\[data-slot="table"\]\s*\{[\s\S]{0,140}?table-layout: fixed/.test(css) &&
        !serverRoute.includes("min-w-[79rem]"),
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
    dataTable.includes("columnWidths?: TableColumnWidths") &&
        dataTable.includes("<col key={column.id}") &&
        serverRoute.includes("columnWidths={tableColumnWidths.server}") &&
        [
            "server",
            "service",
            "cron",
            "ddns",
            "nat",
            "notification",
            "alertRule",
            "serverGroup",
            "notificationGroup",
            "user",
            "onlineUser",
            "waf",
        ].every((layout) => tableLayout.includes(`${layout}: {`)) &&
        serverRoute.includes("data-server-ip-list") &&
        serverRoute.includes("addresses.map((address)"),
)
check(
    "tables",
    "every table layout allocates exactly one hundred percent",
    tableLayouts.length === 12 && tableLayouts.every(({ total }) => total === 100),
    tableLayouts
        .filter(({ total }) => total !== 100)
        .map(({ name, total }) => `${name}: ${total}%`)
        .join(", "),
)
check(
    "tabs",
    "route tabs share one simple left-aligned implementation",
    routeTabs.includes("export function RouteTabs") &&
        routeTabs.includes("justify-start gap-2.5") &&
        routeTabs.includes('className="w-auto px-0"') &&
        !routeTabs.includes("gridTemplateColumns") &&
        settingsTab.includes("<RouteTabs") &&
        notificationTab.includes("<RouteTabs") &&
        groupTab.includes("<RouteTabs") &&
        tabs.includes("bg-transparent") &&
        tabs.includes("text-xl") &&
        tabs.includes("data-[state=active]:font-semibold") &&
        tabs.includes("text-muted-foreground") &&
        !tabs.includes("data-[state=active]:bg-background") &&
        !tabs.includes("data-[state=active]:shadow") &&
        !css.includes('[data-slot="tabs-trigger"]::after'),
)
check(
    "tables",
    "mobile rows keep the name first across a two-column card",
    /@media \(max-width: 48rem\)[\s\S]*?\[data-slot="table-scroll"\]\s*\{[\s\S]{0,100}?overflow: visible/.test(
        css,
    ) &&
        /@media \(max-width: 48rem\)[\s\S]*?tbody tr\s*\{[\s\S]{0,240}?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/.test(
            css,
        ) &&
        !/@media \(max-width: 24rem\)[\s\S]*?tbody tr\s*\{[\s\S]{0,180}?grid-template-columns: minmax\(0, 1fr\)/.test(
            css,
        ) &&
        /td\[data-table-primary\]\s*\{[\s\S]{0,100}?order: -1/.test(css) &&
        css.includes("td[data-table-actions]") &&
        css.includes("td[data-table-select]"),
)
check(
    "tables",
    "mobile selection control matches action geometry and vertical alignment",
    /td\[data-table-select\]\s*\{[\s\S]{0,320}?width: 2\.25rem;[\s\S]{0,80}?height: 2\.25rem/.test(
        css,
    ) &&
        css.includes('td[data-table-select] > [role="checkbox"]') &&
        css.includes("transform: none"),
)
check(
    "settings",
    "settings use reusable themed card and grid sections",
    settings.match(/<SettingsSection/g)?.length === 5 &&
        settingsSection.includes("data-settings-section") &&
        !settingsSection.includes("data-settings-section-icon") &&
        !settingsSection.includes("LucideIcon") &&
        settings.includes("data-settings-footer") &&
        settings.includes("data-settings-inline-control") &&
        settings.includes("data-settings-alert") &&
        css.includes(".admin-content [data-settings-section]") &&
        css.includes(".admin-content [data-settings-grid]"),
)
check(
    "settings",
    "settings sections share one divided panel",
    settings.includes("<div data-settings-panel>") &&
        css.includes("[data-settings-panel]") &&
        css.includes("[data-settings-panel] > [data-settings-section] + [data-settings-section]") &&
        !css.includes("[data-settings-panel] [data-settings-footer]") &&
        /<\/SettingsSection>\s*<\/div>\s*<div data-settings-footer/.test(settings),
)
check(
    "settings",
    "settings cards have no decorative left rail",
    !css.includes("[data-settings-section]::before"),
)
check(
    "settings",
    "settings inline controls have no outer border",
    /\[data-settings-control-row\][\s\S]{0,240}?border: 0;/.test(css) &&
        /\[data-settings-footer\][\s\S]{0,260}?border: 0;/.test(css),
)
check(
    "navigation",
    "sticky navigation has a stable flex size and isolated paint",
    /\.admin-navigation\s*\{[\s\S]{0,500}?height: max-content;[\s\S]{0,180}?align-self: flex-start;[\s\S]{0,240}?contain: layout paint/.test(
        css,
    ),
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
        !css.includes("backdrop-filter: blur(1rem)") &&
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
    "quality",
    "mobile table page headings defer to the action toolbar",
    tablePageHeader.includes("data-admin-page-title") &&
        /@media \(max-width: 48rem\)[\s\S]*?\[data-admin-page-title\]\s*\{[\s\S]{0,80}?display: none/.test(
            css,
        ),
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
