import { type ReactNode } from "react"

interface SettingsSectionProps {
    children: ReactNode
    title: ReactNode
}

export function SettingsSection({ children, title }: SettingsSectionProps) {
    return (
        <section data-settings-section data-settings-span="full">
            <header data-settings-section-header>
                <h2>{title}</h2>
            </header>
            <div data-settings-grid>{children}</div>
        </section>
    )
}
