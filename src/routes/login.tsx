import { Oauth2RequestType, getOauth2RedirectURL } from "@/api/oauth2"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { GitHubIcon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import useSetting from "@/hooks/useSetting"
import { zodResolver } from "@hookform/resolvers/zod"
import i18next from "i18next"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    username: z.string().min(2, { message: i18next.t("Results.UsernameMin", { number: 2 }) }),
    password: z.string().min(1, { message: i18next.t("Results.PasswordRequired") }),
})

function Login() {
    const { login, loginOauth2 } = useAuth()
    const { data: settingData } = useSetting()
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("oauth2")) loginOauth2()
        // OAuth callback is consumed once on mount; the auth context methods
        // intentionally change identity after profile publication.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "" },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await login(values.username, values.password)
    }

    async function loginWith(provider: string) {
        try {
            const redirectUrl = await getOauth2RedirectURL(provider, Oauth2RequestType.LOGIN)
            window.location.assign(redirectUrl.redirect!)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const siteName = settingData?.config?.site_name || t("nezha")

    return (
        <div className="grid min-h-dvh bg-background lg:grid-cols-2">
            <section className="relative hidden overflow-hidden bg-[#0b0d0c] p-10 text-white lg:flex lg:flex-col">
                <div className="flex items-center gap-3">
                    <img className="size-9 rounded-md" src="/dashboard/logo.png" alt="" />
                    <div>
                        <p className="text-sm font-semibold">{siteName}</p>
                        <p className="text-[11px] text-white/48">
                            {t("Navigation.Console", { defaultValue: "Management Console" })}
                        </p>
                    </div>
                </div>
                <div className="my-auto py-12">
                    <p className="text-[5rem] font-semibold leading-[0.84] tracking-[0] text-white/92 xl:text-[7rem]">
                        NEZHA
                    </p>
                    <p className="mt-6 text-[5rem] font-semibold leading-[0.84] tracking-[0] text-white/58 xl:text-[7rem]">
                        MONITOR
                    </p>
                    <p className="mt-6 text-[5rem] font-semibold leading-[0.84] tracking-[0] text-white/32 xl:text-[7rem]">
                        NODE
                    </p>
                </div>
                <p className="max-w-md text-xs leading-6 text-white/42">
                    {t("Navigation.LoginDescription", {
                        defaultValue: "A focused workspace for servers, monitoring and automation.",
                    })}
                </p>
            </section>

            <section className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-[420px]">
                    <header className="mb-6 text-center">
                        <img className="mx-auto mb-4 size-12 rounded-md" src="/dashboard/logo.png" alt="" />
                        <h1 className="text-xl font-semibold">{siteName}</h1>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t("Navigation.LoginPrompt", { defaultValue: "Sign in to the management console" })}
                        </p>
                    </header>

                    <div className="rounded-md border bg-card p-6 sm:p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Username")}</FormLabel>
                                            <FormControl>
                                                <Input autoComplete="username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Password")}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        autoComplete="current-password"
                                                        className="pr-10"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowPassword((visible) => !visible)}
                                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {t("Login")}
                                </Button>
                            </form>
                        </Form>

                        {!!settingData?.config?.oauth2_providers?.length && (
                            <>
                                <div className="my-5 flex items-center gap-3">
                                    <Separator className="flex-1" />
                                    <span className="text-[10px] text-muted-foreground">OAuth2</span>
                                    <Separator className="flex-1" />
                                </div>
                                <div className="grid gap-2">
                                    {settingData.config.oauth2_providers.map((provider: string) => (
                                        <Button key={provider} type="button" variant="outline" onClick={() => loginWith(provider)}>
                                            {provider === "GitHub" && <GitHubIcon className="size-4" />}
                                            {provider}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Login
