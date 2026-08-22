import { Oauth2RequestType, getOauth2RedirectURL, unbindOauth2 } from "@/api/oauth2"
import { getProfile } from "@/api/user"
import { ProfileCard } from "@/components/profile"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMainStore } from "@/hooks/useMainStore"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useServer } from "@/hooks/useServer"
import useSetting from "@/hooks/useSetting"
import { Boxes, Server } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

export default function ProfilePage() {
    const { profile, setProfile } = useMainStore()
    const { servers, serverGroups } = useServer()
    const { data: settingData } = useSetting()
    const isDesktop = useMediaQuery("(min-width: 890px)")

    useEffect(() => {
        const oauth2 = new URLSearchParams(window.location.search).get("oauth2")
        if (oauth2) {
            getProfile().then((profile) => {
                setProfile(profile)
            })
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [window.location.search])

    const bindO2 = async (provider: string) => {
        try {
            const redirectUrl = await getOauth2RedirectURL(provider, Oauth2RequestType.BIND)
            window.location.href = redirectUrl.redirect!
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const unbindO2 = async (provider: string) => {
        try {
            await unbindOauth2(provider)
            const profile = await getProfile()
            setProfile(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        profile && (
            <div className={`admin-page flex gap-4 ${isDesktop ? "items-start" : "flex-col"}`}>
                <div
                    className={`flex ${isDesktop ? "flex-col mr-6" : "gap-4 w-full items-center"}`}
                >
                    <Avatar className={`${isDesktop ? "size-24" : "size-16"} border bg-muted`}>
                        <AvatarFallback className="text-xl font-semibold">
                            {profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="justify-center text-3xl font-semibold">{profile.username}</p>
                        <p className="text-gray-400">IP: {profile.login_ip || "Unknown"}</p>
                    </div>
                    {isDesktop && (
                        <ProfileCard className="mt-4 flex max-w-[300px] items-center justify-center" />
                    )}
                </div>
                {!isDesktop && (
                    <ProfileCard className="flex max-w-full items-center justify-center" />
                )}
                <div className="w-full">
                    <div className="flex flex-col gap-4">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex gap-2 text-xl items-center">
                                    <Server /> Servers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-lg font-semibold">
                                {servers?.length || 0}
                            </CardContent>
                        </Card>
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex gap-2 text-xl items-center">
                                    <Boxes /> Server Groups
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-lg font-semibold">
                                {serverGroups?.length || 0}
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex gap-2 text-xl items-center">
                                    <Boxes /> Oauth2 bindings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-lg font-semibold">
                                {settingData?.config?.oauth2_providers?.map((provider) => (
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <section className="flex gap-2 items-center">
                                            <p>{provider}: </p>
                                            {profile.oauth2_bind?.[provider.toLowerCase()] && (
                                                <p className=" bg-muted px-1.5 py-0.5 text-sm rounded-full">
                                                    {profile.oauth2_bind?.[provider.toLowerCase()]}
                                                </p>
                                            )}
                                        </section>
                                        {profile.oauth2_bind?.[provider.toLowerCase()] ? (
                                            <Button
                                                className="my-1 w-fit"
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => unbindO2(provider)}
                                            >
                                                Unbind
                                            </Button>
                                        ) : (
                                            <Button
                                                className="my-1"
                                                size="sm"
                                                onClick={() => bindO2(provider)}
                                            >
                                                Bind
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    )
}
