import { RouteTabs } from "@/components/route-tabs"
import type { RouteTabItem } from "@/components/route-tabs"
import { useAuth } from "@/hooks/useAuth"
import { useTranslation } from "react-i18next"

export const SettingsTab = ({ className }: { className?: string }) => {
    const { t } = useTranslation()
    const { profile } = useAuth()

    const isAdmin = profile?.role === 0
    const items: RouteTabItem[] = [
        ...(isAdmin
            ? [
                { to: "/dashboard/settings", label: t("Settings") },
                { to: "/dashboard/settings/user", label: t("User") },
            ]
            : []),
        { to: "/dashboard/settings/online-user", label: t("OnlineUser") },
        { to: "/dashboard/settings/waf", label: t("WAF") },
    ]

    return <RouteTabs className={className} items={items} />
}
