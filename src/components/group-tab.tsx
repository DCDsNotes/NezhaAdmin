import { RouteTabs } from "@/components/route-tabs"
import { useTranslation } from "react-i18next"

export const GroupTab = ({ className }: { className?: string }) => {
    const { t } = useTranslation()

    return (
        <RouteTabs
            className={className}
            items={[
                { to: "/dashboard/server-group", label: t("Server") },
                { to: "/dashboard/notification-group", label: t("Notification") },
            ]}
        />
    )
}
