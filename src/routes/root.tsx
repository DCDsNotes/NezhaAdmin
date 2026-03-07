import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import useSetting from "@/hooks/useSetting"
import i18n from "@/lib/i18n"
import { InjectContext } from "@/lib/inject"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Outlet } from "react-router-dom"

export default function Root() {
    const { t } = useTranslation()
    const { data: settingData, error } = useSetting()

    useEffect(() => {
        document.title = settingData?.config?.site_name || "Nezha Dashboard"
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
            <section className="mx-auto flex min-h-screen flex-col text-sm">
                <div className="flex-1">
                    <Header />
                    <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
                        <Outlet />
                    </main>
                </div>
                <footer className="px-6 pb-8 pt-2 text-center text-xs font-light text-foreground/45">
                    &copy; 2019-{new Date().getFullYear()} {t("nezha")}
                </footer>
            </section>
            <Toaster />
        </ThemeProvider>
    )
}