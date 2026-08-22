import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useAuth } from "@/hooks/useAuth"
import { useMainStore } from "@/hooks/useMainStore"
import { cn } from "@/lib/utils"
import {
    Activity,
    Bell,
    Boxes,
    CalendarClock,
    Globe2,
    Home,
    LogOut,
    Server,
    Settings,
    User2,
    Waypoints,
    type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { ModeToggle } from "./mode-toggle"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { IconButton } from "./xui/icon-button"

type Page = { href: string; label: string; icon: LucideIcon }
type NavigationGroup = { label: string; fallback: string; pages: Page[] }

const navigationGroups: NavigationGroup[] = [
    {
        label: "Navigation.Overview",
        fallback: "Overview",
        pages: [
            { href: "/dashboard", label: "Server", icon: Server },
            { href: "/dashboard/server-group", label: "Group", icon: Boxes },
        ],
    },
    {
        label: "Navigation.Monitoring",
        fallback: "Monitoring",
        pages: [
            { href: "/dashboard/service", label: "Service", icon: Activity },
            { href: "/dashboard/notification", label: "Notification", icon: Bell },
        ],
    },
    {
        label: "Navigation.Network",
        fallback: "Network",
        pages: [
            { href: "/dashboard/ddns", label: "DDNS", icon: Globe2 },
            { href: "/dashboard/nat", label: "NATT", icon: Waypoints },
        ],
    },
    {
        label: "Navigation.System",
        fallback: "System",
        pages: [
            { href: "/dashboard/cron", label: "Task", icon: CalendarClock },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ],
    },
]

function isPageActive(pathname: string, href: string) {
    if (href === "/dashboard") return pathname === href
    if (href === "/dashboard/notification") {
        return pathname === href || pathname === "/dashboard/alert-rule"
    }
    if (href === "/dashboard/server-group") {
        return pathname === href || pathname === "/dashboard/notification-group"
    }
    if (href === "/dashboard/settings") return pathname.startsWith(href)
    return pathname === href
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
    const { t } = useTranslation()
    const { pathname } = useLocation()

    return (
        <nav className="space-y-4" aria-label={t("NavigateTo")}>
            {navigationGroups.map((group) => (
                <section key={group.label}>
                    <p className="mb-1.5 px-2.5 text-[10px] font-medium text-sidebar-foreground/45">
                        {t(group.label, { defaultValue: group.fallback })}
                    </p>
                    <div className="grid gap-0.5">
                        {group.pages.map((item) => {
                            const active = isPageActive(pathname, item.href)
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-sidebar-foreground/68 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        active &&
                                            "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-border",
                                    )}
                                    onClick={onNavigate}
                                >
                                    <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                                    <span className="truncate">{t(item.label)}</span>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            ))}
        </nav>
    )
}

function ProfileMenu({ username, logout }: { username: string; logout: () => void }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const initials = username.slice(0, 2).toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                    <Avatar className="size-7 border bg-muted">
                        <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-28 truncate text-xs xl:block">{username}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="break-all">{username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                        <User2 />
                        {t("Profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
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
    )
}

function Brand() {
    const { t } = useTranslation()

    return (
        <Link className="flex min-w-0 items-center gap-2.5" to="/dashboard">
            <img className="size-8 shrink-0 rounded-md" src="/dashboard/logo.png" alt="" />
            <span className="min-w-0 leading-tight">
                <strong className="block truncate text-[13px] font-semibold">{t("nezha")}</strong>
                <span className="block truncate text-[10px] text-muted-foreground">
                    {t("Navigation.Console", { defaultValue: "Management Console" })}
                </span>
            </span>
        </Link>
    )
}

export default function Header() {
    const { t } = useTranslation()
    const { logout } = useAuth()
    const profile = useMainStore((store) => store.profile)
    const [drawerOpen, setDrawerOpen] = useState(false)

    if (!profile) return null

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[216px] flex-col border-r bg-sidebar lg:flex">
                <div className="flex h-14 items-center border-b px-4">
                    <Brand />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
                    <Navigation />
                </div>
                <div className="flex items-center justify-between border-t px-3 py-2.5">
                    <span className="text-[10px] text-muted-foreground">&copy; {new Date().getFullYear()}</span>
                    <Button variant="ghost" size="icon" className="size-8" asChild title={t("BackToHome")}>
                        <a href="/" aria-label={t("BackToHome")}>
                            <Home />
                        </a>
                    </Button>
                </div>
            </aside>

            <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm lg:fixed lg:right-8 lg:top-5 lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
                <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:h-auto lg:p-0">
                    <div className="lg:hidden">
                        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                            <DrawerTrigger aria-label={t("NavigateTo")} asChild>
                                <IconButton icon="menu" variant="ghost" />
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader className="text-left">
                                    <DrawerTitle>{t("NavigateTo")}</DrawerTitle>
                                    <DrawerDescription>{t("SelectAPageToNavigateTo")}</DrawerDescription>
                                </DrawerHeader>
                                <div className="max-h-[65dvh] overflow-y-auto px-4">
                                    <Navigation onNavigate={() => setDrawerOpen(false)} />
                                </div>
                                <DrawerFooter>
                                    <DrawerClose asChild>
                                        <Button variant="outline">{t("Close")}</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    </div>
                    <div className="lg:hidden">
                        <Brand />
                    </div>
                    <div className="ml-auto flex items-center gap-0.5 rounded-md border bg-card p-0.5 shadow-sm">
                        <Button variant="ghost" size="icon" className="size-8" asChild title={t("BackToHome")}>
                            <a href="/" aria-label={t("BackToHome")}>
                                <Home />
                            </a>
                        </Button>
                        <ModeToggle />
                        <ProfileMenu username={profile.username} logout={logout} />
                    </div>
                </div>
            </header>
        </>
    )
}
