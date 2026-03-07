import { ModeToggle } from "@/components/mode-toggle"
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
import { cn } from "@/lib/utils"
import { LogOut, Settings, User2 } from "lucide-react"
import { DateTime } from "luxon"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
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

type NavItem = {
    href: string
    label: string
    active: boolean
}

export default function Header() {
    const { t } = useTranslation()
    const { logout } = useAuth()
    const profile = useMainStore((store) => store.profile)

    const location = useLocation()
    const navigate = useNavigate()
    const isDesktop = useMediaQuery("(min-width: 890px)")

    const [open, setOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const navItems: NavItem[] = [
        {
            href: "/dashboard",
            label: t("Server"),
            active: location.pathname === "/dashboard",
        },
        {
            href: "/dashboard/service",
            label: t("Service"),
            active: location.pathname === "/dashboard/service",
        },
        {
            href: "/dashboard/cron",
            label: t("Task"),
            active: location.pathname === "/dashboard/cron",
        },
        {
            href: "/dashboard/notification",
            label: t("Notification"),
            active:
                location.pathname === "/dashboard/notification" ||
                location.pathname === "/dashboard/alert-rule",
        },
        {
            href: "/dashboard/ddns",
            label: t("DDNS"),
            active: location.pathname === "/dashboard/ddns",
        },
        {
            href: "/dashboard/nat",
            label: t("NATT"),
            active: location.pathname === "/dashboard/nat",
        },
        {
            href: "/dashboard/server-group",
            label: t("Group"),
            active:
                location.pathname === "/dashboard/server-group" ||
                location.pathname === "/dashboard/notification-group",
        },
    ]

    const profileMenu = profile ? (
        <ProfileMenu
            dropdownOpen={dropdownOpen}
            logout={logout}
            navigate={navigate}
            profile={profile}
            setDropdownOpen={setDropdownOpen}
        />
    ) : null

    return isDesktop ? (
        <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[30px] border border-border/70 bg-card/80 px-4 py-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:px-5 lg:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center justify-between gap-4 xl:justify-start">
                        <BrandLink enabled={!!profile} title={t("nezha")} />
                        <div className="flex items-center gap-2 xl:hidden">
                            <HomeLink label={t("BackToHome")} />
                            <ModeToggle />
                            {profileMenu}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                        <div className="min-w-0">
                            <Overview />
                        </div>
                        <div className="hidden items-center gap-2 xl:flex">
                            <HomeLink label={t("BackToHome")} />
                            <ModeToggle />
                            {profileMenu}
                        </div>
                    </div>
                </div>
                {profile && (
                    <nav className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                className={cn(
                                    "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-all duration-200",
                                    item.active
                                        ? "border-primary/30 bg-primary text-primary-foreground shadow-md"
                                        : "border-border/60 bg-background/55 text-muted-foreground hover:border-border hover:bg-accent/80 hover:text-foreground",
                                )}
                                to={item.href}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="ml-auto hidden items-center gap-2 xl:flex">
                            <HomeLink label={t("BackToHome")} />
                            <ModeToggle />
                        </div>
                    </nav>
                )}
            </div>
        </header>
    ) : (
        <header className="sticky top-0 z-40 px-4 pt-4">
            <div className="mx-auto flex max-w-6xl items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 py-3 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
                {profile && (
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger aria-label="Toggle Menu" asChild>
                            <IconButton icon="menu" variant="outline" />
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader className="text-left">
                                <DrawerTitle>{t("NavigateTo")}</DrawerTitle>
                                <DrawerDescription>{t("SelectAPageToNavigateTo")}</DrawerDescription>
                            </DrawerHeader>
                            <div className="grid gap-2 px-4">
                                {navItems.map((item) => (
                                    <DrawerClose asChild key={item.href}>
                                        <Link
                                            className={cn(
                                                "inline-flex min-h-11 items-center rounded-2xl border px-4 text-sm font-medium transition-all",
                                                item.active
                                                    ? "border-primary/30 bg-primary text-primary-foreground"
                                                    : "border-border/60 bg-background/60 hover:bg-accent/80",
                                            )}
                                            to={item.href}
                                        >
                                            {item.label}
                                        </Link>
                                    </DrawerClose>
                                ))}
                            </div>
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button variant="outline">{t("Close")}</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                )}
                <div className="min-w-0 flex-1">
                    <BrandLink enabled={!!profile} title={t("nezha")} />
                </div>
                <ModeToggle />
                {profileMenu}
            </div>
        </header>
    )
}

function BrandLink({ enabled, title }: { enabled: boolean; title: string }) {
    return (
        <Link
            className="group inline-flex min-w-0 items-center gap-3"
            to={enabled ? "/dashboard" : "#"}
        >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/70 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
                <img className="h-6 w-6" src="/dashboard/logo.png" alt={title} />
            </div>
            <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-tight">{title}</p>
            </div>
        </Link>
    )
}

function HomeLink({ label }: { label: string }) {
    return (
        <a
            href="/"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-full border border-border/60 bg-background/55 px-4 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-accent/80 hover:text-foreground"
        >
            {label}
        </a>
    )
}

function ProfileMenu({
    profile,
    dropdownOpen,
    setDropdownOpen,
    navigate,
    logout,
}: {
    profile: { username: string }
    dropdownOpen: boolean
    setDropdownOpen: (open: boolean) => void
    navigate: ReturnType<typeof useNavigate>
    logout: () => void
}) {
    const { t } = useTranslation()

    return (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    type="button"
                >
                    <Avatar className="h-10 w-10 cursor-pointer border border-border/70 bg-background/70 shadow-sm">
                        <AvatarImage
                            src={"https://gravatar.com/avatar/" + profile.username}
                            alt={profile.username}
                        />
                        <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="break-all">{profile.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                            setDropdownOpen(false)
                            navigate("/dashboard/profile")
                        }}
                    >
                        <User2 />
                        {t("Profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                            setDropdownOpen(false)
                            navigate("/dashboard/settings")
                        }}
                    >
                        <Settings />
                        {t("Settings")}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    <LogOut />
                    {t("Logout")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// https://github.com/streamich/react-use/blob/master/src/useInterval.ts
const useInterval = (callback: () => void, delay?: number | null) => {
    const savedCallback = useRef<() => void>(() => {})
    useEffect(() => {
        savedCallback.current = callback
    })
    useEffect(() => {
        if (delay !== null) {
            const interval = setInterval(() => savedCallback.current(), delay || 0)
            return () => clearInterval(interval)
        }
        return undefined
    }, [delay])
}

function Overview() {
    const { t } = useTranslation()
    const profile = useMainStore((store) => store.profile)
    const timeOption = DateTime.TIME_SIMPLE
    timeOption.hour12 = true

    const [timeString, setTimeString] = useState(
        DateTime.now().setLocale("en-US").toLocaleString(timeOption),
    )

    useInterval(() => {
        setTimeString(DateTime.now().setLocale("en-US").toLocaleString(timeOption))
    }, 1000)

    return (
        <section className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-background/50 px-3 py-2 shadow-sm backdrop-blur-sm">
            {profile ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold">{profile.username}</span>
                    {profile.login_ip && (
                        <span className="text-xs text-muted-foreground">from {profile.login_ip}</span>
                    )}
                </div>
            ) : (
                <p className="text-sm font-semibold">{t("LoginFirst")}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{t("CurrentTime")}</span>
                <span className="font-medium text-foreground">{timeString}</span>
            </div>
        </section>
    )
}