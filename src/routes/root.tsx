import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { useMainStore } from "@/hooks/useMainStore"
import useSetting from "@/hooks/useSetting"
import i18n from "@/lib/i18n"
import { InjectContext } from "@/lib/inject"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Outlet, useLocation } from "react-router-dom"

export default function Root() {
    const { t } = useTranslation()
    const { data: settingData, error } = useSetting()
    const profile = useMainStore((store) => store.profile)
    const { pathname } = useLocation()
    const isLogin = pathname === "/dashboard/login"

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
                className={cn(
                    "flex min-h-dvh flex-col bg-background text-sm",
                    profile && !isLogin && "lg:pl-[216px]",
                )}
            >
                {!isLogin && <Header />}
                <div className="flex min-w-0 flex-1 flex-col">
                    <main className={cn("admin-main w-full flex-1", !isLogin && "px-4 sm:px-6 lg:px-8 lg:pt-14")}>
                        <Outlet />
                    </main>
                    {!isLogin && (
                        <footer className="border-t py-3 text-center text-[11px] text-muted-foreground">
                            &copy; 2019-{new Date().getFullYear()} {t("nezha")}
                        </footer>
                    )}
                </div>
            </section>
            <Toaster />
        </ThemeProvider>
    )
}
