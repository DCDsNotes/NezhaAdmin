import { Oauth2RequestType, getOauth2RedirectURL, unbindOauth2 } from "@/api/oauth2"
import { getProfile } from "@/api/user"
import { ProfileCard } from "@/components/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMainStore } from "@/hooks/useMainStore"
import { useServer } from "@/hooks/useServer"
import useSetting from "@/hooks/useSetting"
import { getSafeHttpRedirect } from "@/lib/safe-redirect"
import { Boxes, Server } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export default function ProfilePage() {
    const { profile, setProfile } = useMainStore()
    const { t } = useTranslation()
    const { servers, serverGroups } = useServer()
    const { data: settingData } = useSetting()
    const oauth2Callback = new URLSearchParams(window.location.search).get("oauth2")

    useEffect(() => {
        if (!oauth2Callback) return

        let active = true
        window.history.replaceState({}, document.title, window.location.pathname)
        getProfile()
            .then((profile) => {
                if (active) setProfile({ ...profile, role: profile.role === 0 ? 0 : 1 })
            })
            .catch((error: Error) => toast.error(error.message))

        return () => {
            active = false
        }
    }, [oauth2Callback, setProfile])

    const bindO2 = async (provider: string) => {
        try {
            const redirectUrl = await getOauth2RedirectURL(provider, Oauth2RequestType.BIND)
            window.location.assign(getSafeHttpRedirect(redirectUrl.redirect))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }

    const unbindO2 = async (provider: string) => {
        try {
            await unbindOauth2(provider)
            const profile = await getProfile()
            setProfile({ ...profile, role: profile.role === 0 ? 0 : 1 })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }

    return (
        profile && (
            <div data-admin-page className="space-y-4">
                <div data-admin-page-header className="flex items-center justify-between gap-3">
                    <h1>{t("Profile")}</h1>
                    <ProfileCard />
                </div>

                <Card className="gap-5 p-5">
                    <div className="flex flex-wrap items-center gap-4">
                        <Avatar className="size-20 border">
                            <AvatarImage
                                src={"https://gravatar.com/avatar/" + profile.username}
                                alt={profile.username}
                            />
                            <AvatarFallback>{profile.username}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold">{profile.username}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                IP: {profile.login_ip || "Unknown"}
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="gap-3 p-5">
                        <CardHeader className="p-0">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Server className="size-4" /> {t("Server")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 text-2xl font-semibold tabular-nums">
                            {servers?.length || 0}
                        </CardContent>
                    </Card>
                    <Card className="gap-3 p-5">
                        <CardHeader className="p-0">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Boxes className="size-4" /> {t("Group")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 text-2xl font-semibold tabular-nums">
                            {serverGroups?.length || 0}
                        </CardContent>
                    </Card>
                </div>

                <Card className="gap-4 p-5">
                    <CardHeader className="p-0">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Boxes className="size-4" /> OAuth2 bindings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y p-0">
                        {settingData?.config?.oauth2_providers?.map((provider) => {
                            const binding = profile.oauth2_bind?.[provider.toLowerCase()]
                            return (
                                <div
                                    key={provider}
                                    className="flex min-h-12 items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-0 text-sm">
                                        <p className="font-medium">{provider}</p>
                                        {binding && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {binding}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant={binding ? "outline" : "default"}
                                        size="sm"
                                        onClick={() =>
                                            binding ? unbindO2(provider) : bindO2(provider)
                                        }
                                    >
                                        {binding ? "Unbind" : "Bind"}
                                    </Button>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        )
    )
}
