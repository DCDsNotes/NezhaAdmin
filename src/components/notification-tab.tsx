import { RouteTabs } from "@/components/route-tabs"
import { useTranslation } from "react-i18next"

export const NotificationTab = ({ className }: { className?: string }) => {
    const { t } = useTranslation()

    return (
        <RouteTabs
            className={className}
            items={[
                { to: "/dashboard/notification", label: t("Notifier") },
                { to: "/dashboard/alert-rule", label: t("AlertRule") },
            ]}
        />
    )
}
