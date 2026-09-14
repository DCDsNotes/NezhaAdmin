import { type LucideIcon } from "lucide-react"
import { type ReactNode } from "react"

interface SettingsSectionProps {
    children: ReactNode
    icon: LucideIcon
    title: ReactNode
}

export function SettingsSection({ children, icon: Icon, title }: SettingsSectionProps) {
    return (
        <section data-settings-section data-settings-span="full">
            <header data-settings-section-header>
                <span data-settings-section-icon aria-hidden="true">
                    <Icon />
                </span>
                <h2>{title}</h2>
            </header>
            <div data-settings-grid>{children}</div>
        </section>
    )
}
