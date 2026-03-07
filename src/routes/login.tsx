import { Oauth2RequestType, getOauth2RedirectURL } from "@/api/oauth2"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { GitHubIcon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import useSetting from "@/hooks/useSetting"
import { zodResolver } from "@hookform/resolvers/zod"
import i18next from "i18next"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    username: z.string().min(2, {
        message: i18next.t("Results.UsernameMin", { number: 2 }),
    }),
    password: z.string().min(1, {
        message: i18next.t("Results.PasswordRequired"),
    }),
})

function Login() {
    const { login, loginOauth2 } = useAuth()
    const { data: settingData } = useSetting()

    useEffect(() => {
        const oauth2 = new URLSearchParams(window.location.search).get("oauth2")
        if (oauth2) {
            loginOauth2()
        }
    }, [window.location.search])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        login(values.username, values.password)
    }

    async function loginWith(provider: string) {
        try {
            const redirectUrl = await getOauth2RedirectURL(provider, Oauth2RequestType.LOGIN)
            window.location.href = redirectUrl.redirect!
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const { t } = useTranslation()

    return (
        <div className="mx-auto mt-10 w-full max-w-md sm:mt-16">
            <Card className="overflow-hidden">
                <CardHeader className="space-y-3 pb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/70 shadow-sm">
                        <img className="h-7 w-7" src="/dashboard/logo.png" alt={t("nezha")} />
                    </div>
                    <div className="space-y-1">
                        <CardTitle>{t("Login")}</CardTitle>
                        <CardDescription>{t("nezha")}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Username")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin" autoComplete="username" {...field} />
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
                                            <Input
                                                type="password"
                                                placeholder="admin"
                                                autoComplete="current-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                {t("Login")}
                            </Button>
                        </form>
                    </Form>
                    {settingData?.config?.oauth2_providers &&
                        settingData?.config?.oauth2_providers.length > 0 && (
                            <section className="flex items-center gap-3">
                                <Separator className="flex-1" />
                                <div className="text-xs text-muted-foreground">OAuth2</div>
                                <Separator className="flex-1" />
                            </section>
                        )}
                    <div className="flex flex-col gap-3">
                        {settingData?.config?.oauth2_providers?.map((p: string) => (
                            <Button key={p} variant="outline" className="w-full" onClick={() => loginWith(p)}>
                                {p === "GitHub" && <GitHubIcon className="size-4" />}
                                {p}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login