import { AdminNavigation } from "@/components/admin-navigation"
import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { useMainStore } from "@/hooks/useMainStore"
import useSetting from "@/hooks/useSetting"
import i18n from "@/lib/i18n"
import { InjectContext } from "@/lib/inject"
import { resolveSiteName } from "@/lib/site-name"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Outlet } from "react-router-dom"

type RootProps = {
    forceGuest?: boolean
}

export default function Root({ forceGuest = false }: RootProps) {
    const { t } = useTranslation()
    const { data: settingData, error } = useSetting()
    const profile = useMainStore((store) => store.profile)
    const siteName = resolveSiteName(settingData?.config?.site_name)
    const guestLayout = forceGuest || !profile

    useEffect(() => {
        document.title = siteName
    }, [siteName])

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
                className={`admin-shell ${guestLayout ? "admin-shell--guest" : "admin-shell--authenticated"}`}
            >
                <Header siteName={siteName} forceGuest={forceGuest} />
                <div className="admin-page">
                    <div className="admin-layout">
                        {!guestLayout && <AdminNavigation />}
                        <div className="admin-workspace">
                            <main className="admin-content">
                                <Outlet />
                            </main>
                            <footer className="admin-footer">
                                &copy; 2019-{new Date().getFullYear()} {t("nezha")}
                            </footer>
                        </div>
                    </div>
                </div>
            </section>
            <Toaster />
        </ThemeProvider>
    )
}
