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
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Home, LogOut, Settings, User2 } from "lucide-react"
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

const pages = [
    { href: "/dashboard", label: "Server" },
    { href: "/dashboard/service", label: "Service" },
    { href: "/dashboard/cron", label: "Task" },
    { href: "/dashboard/notification", label: "Notification" },
    { href: "/dashboard/ddns", label: "DDNS" },
    { href: "/dashboard/nat", label: "NATT" },
    { href: "/dashboard/server-group", label: "Group" },
] as const

function isPageActive(pathname: string, href: string) {
    if (href === "/dashboard/notification") {
        return pathname === href || pathname === "/dashboard/alert-rule"
    }
    if (href === "/dashboard/server-group") {
        return pathname === href || pathname === "/dashboard/notification-group"
    }
    return pathname === href
}

function ProfileMenu({ username, logout }: { username: string; logout: () => void }) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="size-8 cursor-pointer border bg-muted">
                    <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
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

export default function Header() {
    const { t } = useTranslation()
    const { logout } = useAuth()
    const profile = useMainStore((store) => store.profile)
    const location = useLocation()
    const isDesktop = useMediaQuery("(min-width: 1024px)")
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
                {!isDesktop && profile ? (
                    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                        <DrawerTrigger aria-label={t("NavigateTo")} asChild>
                            <IconButton icon="menu" variant="ghost" />
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader className="text-left">
                                <DrawerTitle>{t("NavigateTo")}</DrawerTitle>
                                <DrawerDescription>{t("SelectAPageToNavigateTo")}</DrawerDescription>
                            </DrawerHeader>
                            <nav className="grid gap-1 px-4">
                                {pages.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        {t(item.label)}
                                    </Link>
                                ))}
                            </nav>
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button variant="outline">{t("Close")}</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                ) : null}

                <Link className="inline-flex shrink-0 items-center gap-2 font-semibold" to={profile ? "/dashboard" : "#"}>
                    <img className="size-8" src="/dashboard/logo.png" alt="" />
                    <span>{t("nezha")}</span>
                </Link>

                {isDesktop && profile ? (
                    <nav className="ml-3 flex min-w-0 flex-1 items-center gap-1" aria-label={t("NavigateTo")}>
                        {pages.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                aria-current={isPageActive(location.pathname, item.href) ? "page" : undefined}
                                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
                            >
                                {t(item.label)}
                            </Link>
                        ))}
                    </nav>
                ) : (
                    <span className="flex-1" />
                )}

                <div className="ml-auto flex shrink-0 items-center gap-1">
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
    )
}
