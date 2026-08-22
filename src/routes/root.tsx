import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { useMainStore } from "@/hooks/useMainStore"
import useSetting from "@/hooks/useSetting"
import i18n from "@/lib/i18n"
import { InjectContext } from "@/lib/inject"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Outlet } from "react-router-dom"

function readSidebarCollapsed() {
    if (typeof window === "undefined") return false
    try {
        return window.localStorage.getItem("nezha-admin-sidebar-collapsed") === "true"
    } catch {
        return false
    }
}

export default function Root() {
    const { t } = useTranslation()
    const { data: settingData, error } = useSetting()
    const profile = useMainStore((store) => store.profile)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

    useEffect(() => {
        localStorage.setItem("nezha-admin-sidebar-collapsed", String(sidebarCollapsed))
    }, [sidebarCollapsed])

    useEffect(() => {
        document.title = settingData?.config?.site_name || "哪吒监控"
    }, [settingData?.config?.site_name])

    useEffect(() => {
        if (settingData?.config?.custom_code_dashboard) {
            InjectContext(settingData?.config?.custom_code_dashboard)
        }
    }, [settingData?.config?.custom_code_dashboard])

    if (error) {
        throw error
    }

    if (!settingData) {
        return null
    }

    if (settingData?.config?.language && !localStorage.getItem("language")) {
        i18n.changeLanguage(settingData?.config?.language)
    }

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <section
                className={`admin-shell ${profile ? "admin-shell--authenticated" : "admin-shell--guest"}`}
            >
                <Header
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
                />
                <div className="admin-workspace">
                    <main className="admin-content">
                        <Outlet />
                    </main>
                    <footer className="admin-footer">
                        &copy; 2019-{new Date().getFullYear()} {t("nezha")}
                    </footer>
                </div>
            </section>
            <Toaster />
        </ThemeProvider>
    )
}
