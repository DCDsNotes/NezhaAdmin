import {
    BellRing,
    CalendarClock,
    FolderKanban,
    Globe2,
    Network,
    Server,
    Settings,
    ShieldCheck,
} from "lucide-react"
import { type ComponentType, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"

type AdminNavigationItem = {
    href: string
    label: string
    icon: ComponentType<{ className?: string }>
    matches?: string[]
}

export function useAdminNavigation() {
    const { t } = useTranslation()
    const location = useLocation()
    const items = useMemo<AdminNavigationItem[]>(
        () => [
            { href: "/dashboard", label: t("Server"), icon: Server },
            { href: "/dashboard/service", label: t("Service"), icon: Globe2 },
            { href: "/dashboard/cron", label: t("Task"), icon: CalendarClock },
            { href: "/dashboard/ddns", label: t("DDNS"), icon: Network },
            { href: "/dashboard/nat", label: t("NATT"), icon: ShieldCheck },
            {
                href: "/dashboard/notification",
                label: t("Notification"),
                icon: BellRing,
                matches: ["/dashboard/alert-rule"],
            },
            {
                href: "/dashboard/server-group",
                label: t("Group"),
                icon: FolderKanban,
                matches: ["/dashboard/notification-group"],
            },
            {
                href: "/dashboard/settings",
                label: t("Settings"),
                icon: Settings,
                matches: [
                    "/dashboard/settings/user",
                    "/dashboard/settings/waf",
                    "/dashboard/settings/online-user",
                    "/dashboard/profile",
                ],
            },
        ],
        [t],
    )
    const isActive = (item: AdminNavigationItem) =>
        location.pathname === item.href || Boolean(item.matches?.includes(location.pathname))

    return { items, isActive, current: items.find(isActive) }
}
