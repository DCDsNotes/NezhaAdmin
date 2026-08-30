import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useMainStore } from "@/hooks/useMainStore"
import {
    BellRing,
    CalendarClock,
    ChevronRight,
    FolderKanban,
    Globe2,
    Home,
    LogOut,
    Menu,
    Network,
    PanelLeftClose,
    PanelLeftOpen,
    RefreshCcw,
    Server,
    Settings,
    ShieldCheck,
    User2,
    X,
} from "lucide-react"
import { DateTime } from "luxon"
import { type ComponentType, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"

type NavItem = {
    href: string
    label: string
    icon: ComponentType<{ className?: string }>
    matches?: string[]
}

type NavGroup = {
    label: string
    items: NavItem[]
}

function useInterval(callback: () => void, delay: number) {
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        const timer = window.setInterval(() => callbackRef.current(), delay)
        return () => window.clearInterval(timer)
    }, [delay])
}

function Overview() {
    const { t, i18n } = useTranslation()
    const profile = useMainStore((store) => store.profile)
    const [now, setNow] = useState(DateTime.now())

    useInterval(() => setNow(DateTime.now()), 1000)

    return (
        <div className="admin-context">
            <span>{profile ? t("Navigation.Workspace") : t("LoginFirst")}</span>
            <strong>{profile?.username || t("nezha")}</strong>
            <small>
                {t("CurrentTime")} · {now.setLocale(i18n.language).toFormat("yyyy-LL-dd HH:mm:ss")}
            </small>
        </div>
    )
}

type HeaderProps = {
    sidebarCollapsed: boolean
    onToggleSidebar: () => void
    siteName: string
}

export default function Header({ sidebarCollapsed, onToggleSidebar, siteName }: HeaderProps) {
    const { t } = useTranslation()
    const { logout } = useAuth()
    const profile = useMainStore((store) => store.profile)
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const groups = useMemo<NavGroup[]>(
        () => [
            {
                label: t("Navigation.Monitoring"),
                items: [
                    { href: "/dashboard", label: t("Server"), icon: Server },
                    { href: "/dashboard/service", label: t("Service"), icon: Globe2 },
                    { href: "/dashboard/cron", label: t("Task"), icon: CalendarClock },
                ],
            },
            {
                label: t("Navigation.Connectivity"),
                items: [
                    { href: "/dashboard/ddns", label: t("DDNS"), icon: Network },
                    { href: "/dashboard/nat", label: t("NATT"), icon: ShieldCheck },
                ],
            },
            {
                label: t("Navigation.Management"),
                items: [
                    {
                        href: "/dashboard/notification",
                        label: t("Notification"),
                        icon: BellRing,
                        matches: ["/dashboard/alert-rule", "/dashboard/notification-group"],
                    },
                    {
                        href: "/dashboard/server-group",
                        label: t("Group"),
                        icon: FolderKanban,
                    },
                    {
                        href: "/dashboard/settings",
                        label: t("Settings"),
                        icon: Settings,
                        matches: [
                            "/dashboard/settings/user",
                            "/dashboard/settings/waf",
                            "/dashboard/settings/online-user",
                        ],
                    },
                ],
            },
        ],
        [t],
    )

    const allItems = groups.flatMap((group) => group.items)
    const isItemActive = (item: NavItem) =>
        location.pathname === item.href || Boolean(item.matches?.includes(location.pathname))
    const currentItem = allItems.find(isItemActive)

    if (!profile) {
        return (
            <header className="admin-topbar admin-topbar--guest">
                <Link to="/dashboard/login" className="admin-mobile-brand">
                    <img src="/dashboard/logo.png" alt="" />
                    <span>{siteName}</span>
                </Link>
                <div className="admin-topbar__actions">
                    <Button variant="ghost" size="icon" asChild title={t("BackToHome")}>
                        <a href="/" aria-label={t("BackToHome")}>
                            <Home />
                        </a>
                    </Button>
                    <ModeToggle />
                </div>
            </header>
        )
    }

    return (
        <>
            <button
                type="button"
                className={`admin-sidebar-backdrop ${mobileOpen ? "is-visible" : ""}`}
                onClick={() => setMobileOpen(false)}
                aria-label={t("Close")}
                tabIndex={mobileOpen ? 0 : -1}
            />

            <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
                <Link to="/dashboard" className="admin-brand">
                    <img src="/dashboard/logo.png" alt="" />
                    <span>
                        <strong>{siteName}</strong>
                        <small>{t("Navigation.ControlCenter")}</small>
                    </span>
                </Link>

                <nav className="admin-navigation" aria-label={t("NavigateTo")}>
                    {groups.map((group) => (
                        <section key={group.label} className="admin-navigation__group">
                            <h2>{group.label}</h2>
                            {group.items.map((item) => {
                                const Icon = item.icon
                                const active = isItemActive(item)
                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`admin-navigation__item ${active ? "is-active" : ""}`}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        <Icon className="admin-navigation__icon" />
                                        <span>{item.label}</span>
                                        {active ? (
                                            <ChevronRight className="admin-navigation__arrow" />
                                        ) : null}
                                    </Link>
                                )
                            })}
                        </section>
                    ))}
                </nav>

                <div className="admin-sidebar__account">
                    <Avatar>
                        <AvatarFallback className="bg-primary text-[0.625rem] font-semibold text-primary-foreground">
                            {profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span>
                        <strong>{profile.username}</strong>
                        <small>{profile.login_ip || t("OnlineUser")}</small>
                    </span>
                </div>
            </aside>

            <header className="admin-topbar">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="admin-sidebar-toggle"
                    onClick={onToggleSidebar}
                    aria-label={sidebarCollapsed ? "展开侧栏" : "收起侧栏"}
                    title={sidebarCollapsed ? "展开侧栏" : "收起侧栏"}
                >
                    {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="admin-mobile-menu"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-label={mobileOpen ? t("Close") : t("NavigateTo")}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X /> : <Menu />}
                </Button>

                <div className="admin-topbar__title">
                    <span>{currentItem?.label || t("Navigation.Workspace")}</span>
                    <Overview />
                </div>

                <div className="admin-topbar__actions">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="刷新页面"
                        aria-label="刷新页面"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCcw />
                    </Button>
                    <Button variant="ghost" size="icon" asChild title={t("BackToHome")}>
                        <a href="/" aria-label={t("BackToHome")}>
                            <Home />
                        </a>
                    </Button>
                    <ModeToggle />
                    <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="admin-profile-trigger">
                                <Avatar>
                                    <AvatarFallback className="bg-primary text-[0.625rem] font-semibold text-primary-foreground">
                                        {profile.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="admin-profile-name">{profile.username}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="break-all">
                                {profile.username}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setProfileOpen(false)
                                        navigate("/dashboard/profile")
                                    }}
                                >
                                    <User2 />
                                    {t("Profile")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setProfileOpen(false)
                                        navigate("/dashboard/settings")
                                    }}
                                >
                                    <Settings />
                                    {t("Settings")}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>
                                <LogOut />
                                {t("Logout")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </>
    )
}
