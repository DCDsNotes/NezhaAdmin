import { useAdminNavigation } from "@/hooks/useAdminNavigation"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export function AdminNavigation() {
    const { t } = useTranslation()
    const { items, isActive } = useAdminNavigation()

    return (
        <nav className="admin-navigation" aria-label={t("NavigateTo")}>
            {items.map((item) => {
                const Icon = item.icon
                const active = isActive(item)
                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`admin-navigation__item ${active ? "is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                    >
                        <Icon />
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
