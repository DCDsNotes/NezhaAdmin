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

type Page = {
    href: string
    label: string
    icon: LucideIcon
}

const pages: Page[] = [
    { href: "/dashboard", label: "Server", icon: Server },
    { href: "/dashboard/service", label: "Service", icon: Activity },
    { href: "/dashboard/cron", label: "Task", icon: CalendarClock },
    { href: "/dashboard/notification", label: "Notification", icon: Bell },
    { href: "/dashboard/ddns", label: "DDNS", icon: Globe2 },
    { href: "/dashboard/nat", label: "NATT", icon: Waypoints },
    { href: "/dashboard/server-group", label: "Group", icon: Boxes },
]

function isPageActive(pathname: string, href: string) {
    if (href === "/dashboard/notification") {
        return pathname === href || pathname === "/dashboard/alert-rule"
    }
    if (href === "/dashboard/server-group") {
        return pathname === href || pathname === "/dashboard/notification-group"
    }
    return pathname === href
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
    const { t } = useTranslation()
    const { pathname } = useLocation()

    return (
        <nav className="grid gap-1" aria-label={t("NavigateTo")}>
            {pages.map((item) => {
                const active = isPageActive(pathname, item.href)
                const Icon = item.icon
                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            active && "bg-sidebar-primary/12 text-sidebar-primary",
                        )}
                        onClick={onNavigate}
                    >
                        <Icon className="size-4.5 shrink-0" strokeWidth={1.8} />
                        <span>{t(item.label)}</span>
                    </Link>
                )
            })}
        </nav>
    )
}

function ProfileMenu({ username, logout, expanded = false }: { username: string; logout: () => void; expanded?: boolean }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const initials = username.slice(0, 2).toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {expanded ? (
                    <Button variant="ghost" className="h-11 w-full justify-start gap-3 px-2">
                        <Avatar className="size-8 border bg-muted">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate text-left text-sm">{username}</span>
                    </Button>
                ) : (
                    <Avatar className="size-8 cursor-pointer border bg-muted">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={expanded ? "right" : "bottom"} className="w-48">
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
        <Link className="inline-flex min-w-0 items-center gap-3 font-semibold" to="/dashboard">
            <img className="size-8 shrink-0 rounded-md" src="/dashboard/logo.png" alt="" />
            <span className="truncate">{t("nezha")}</span>
        </Link>
    )
}

export default function Header() {
    const { t } = useTranslation()
    const { logout } = useAuth()
    const profile = useMainStore((store) => store.profile)
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <>
            {profile ? (
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-sidebar lg:flex">
                    <div className="flex h-16 items-center border-b px-5">
                        <Brand />
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
                        <p className="mb-2 px-3 text-[11px] font-semibold text-sidebar-foreground/40">{t("NavigateTo")}</p>
                        <Navigation />
                    </div>
                    <div className="space-y-2 border-t p-3">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" asChild title={t("BackToHome")}>
                                <a href="/" aria-label={t("BackToHome")}>
                                    <Home />
                                </a>
                            </Button>
                            <ModeToggle />
                        </div>
                        <ProfileMenu username={profile.username} logout={logout} expanded />
                    </div>
                </aside>
            ) : null}

            <header className={cn("sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm", profile && "lg:hidden")}>
                <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                    {profile ? (
                        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                            <DrawerTrigger aria-label={t("NavigateTo")} asChild>
                                <IconButton icon="menu" variant="ghost" />
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader className="text-left">
                                    <DrawerTitle>{t("NavigateTo")}</DrawerTitle>
                                    <DrawerDescription>{t("SelectAPageToNavigateTo")}</DrawerDescription>
                                </DrawerHeader>
                                <div className="px-4">
                                    <Navigation onNavigate={() => setDrawerOpen(false)} />
                                </div>
                                <DrawerFooter>
                                    <DrawerClose asChild>
                                        <Button variant="outline">{t("Close")}</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    ) : null}

                    <Brand />
                    <div className="ml-auto flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild title={t("BackToHome")}>
                            <a href="/" aria-label={t("BackToHome")}>
                                <Home />
                            </a>
                        </Button>
                        <ModeToggle />
                        {profile ? <ProfileMenu username={profile.username} logout={logout} /> : null}
                    </div>
                </div>
            </header>
        </>
    )
}
