import { updateSettings } from "@/api/settings"
import { SettingsSection } from "@/components/settings-section"
import { SettingsTab } from "@/components/settings-tab"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import useSetting from "@/hooks/useSetting"
import { asOptionalField } from "@/lib/utils"
import { nezhaLang, settingCoverageTypes } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { BellRing, Code2, Network, Palette, Settings2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

const settingFormSchema = z.object({
    dns_servers: asOptionalField(z.string()),
    ignored_ip_notification: asOptionalField(z.string()),
    ip_change_notification_group_id: z.coerce.number().int().min(0),
    cover: z.coerce.number().int().min(1),
    site_name: z.string().min(1),
    language: z.string().min(2),
    user_template: z.string().min(1),
    install_host: asOptionalField(z.string()),
    custom_code: asOptionalField(z.string()),
    custom_code_dashboard: asOptionalField(z.string()),
    web_real_ip_header: asOptionalField(z.string()),
    agent_real_ip_header: asOptionalField(z.string()),

    tls: asOptionalField(z.boolean()),
    enable_ip_change_notification: asOptionalField(z.boolean()),
    enable_plain_ip_in_notification: asOptionalField(z.boolean()),
})

export default function SettingsPage() {
    const { t, i18n } = useTranslation()
    const { data: config, mutate } = useSetting()
    const { profile } = useAuth()
    const navigate = useNavigate()

    const isAdmin = profile?.role === 0

    if (!isAdmin) {
        navigate("/dashboard/settings/online-user")
    }

    const defaultValues = {
        ip_change_notification_group_id: 0,
        cover: 1,
        site_name: "",
        language: "",
        ...config?.config,
        user_template:
            config?.config?.user_template ||
            config?.frontend_templates?.find((template) => !template.is_admin)?.path ||
            "user-dist",
    }

    const form = useForm({
        resolver: zodResolver(settingFormSchema) as any,
        defaultValues,
        resetOptions: {
            keepDefaultValues: false,
        },
    })

    useEffect(() => {
        if (config?.config) {
            form.reset(config?.config)
        }
    }, [config?.config, form])

    const onSubmit = async (values: any) => {
        try {
            await updateSettings(values)
            form.reset()
            await mutate()
        } catch (e) {
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: e?.toString(),
                }),
            })
            return
        } finally {
            if (values.language != i18n.language) {
                i18n.changeLanguage(values.language)
            }
            toast(t("Success"))
        }
    }

    return (
        <div data-admin-page className="px-3">
            <SettingsTab className="mt-6 mb-4 w-full" />
            <div>
                <Form {...form}>
                    <form
                        data-slot="settings-form"
                        data-settings-panel
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="my-4 flex flex-col gap-5"
                    >
                        <SettingsSection icon={Settings2} title={t("Settings")}>
                            <FormField
                                control={form.control}
                                name="site_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("SiteName")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Language")}</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(nezhaLang).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>
                                                            {v}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </SettingsSection>
                        <SettingsSection icon={Palette} title={t("Theme")}>
                            <FormField
                                control={form.control}
                                name="user_template"
                                render={({ field }) => (
                                    <FormItem data-settings-span="full">
                                        <FormLabel>{t("Theme")}</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    const template =
                                                        config?.frontend_templates?.find(
                                                            (t) => t.path === value,
                                                        )
                                                    if (template) {
                                                        form.setValue(
                                                            "user_template",
                                                            template!.path!,
                                                        )
                                                    }
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-auto min-h-14 py-3">
                                                        <SelectValue
                                                            placeholder={t("SelectTheme")}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(
                                                        config?.frontend_templates?.filter(
                                                            (t) => !t.is_admin,
                                                        ) || []
                                                    ).map((template) => (
                                                        <div key={template.path}>
                                                            <SelectItem value={template.path!}>
                                                                <div className="flex flex-col items-start gap-1">
                                                                    <div className="font-medium">
                                                                        {template.name}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <span>
                                                                            {t("Author")}:{" "}
                                                                            {template.author}
                                                                        </span>
                                                                        {!template.is_official ? (
                                                                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                                                                {t("Community")}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                                                                {t("Official")}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                            <div className="px-8 py-1">
                                                                <a
                                                                    href={template.repository}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-primary underline-offset-4 hover:underline"
                                                                >
                                                                    {template.repository}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                        {!config?.frontend_templates?.find(
                                            (t) => t.path === field.value,
                                        )?.is_official && (
                                            <div data-settings-alert>
                                                <div className="mb-1 font-medium">
                                                    {t("CommunityThemeWarning")}
                                                </div>
                                                <div>{t("CommunityThemeDescription")}</div>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </SettingsSection>
                        <SettingsSection icon={Code2} title={t("CustomCodes")}>
                            <FormField
                                control={form.control}
                                name="custom_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("CustomCodes")}</FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-y min-h-48" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="custom_code_dashboard"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("CustomCodesDashboard")}</FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-y min-h-48" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </SettingsSection>
                        <SettingsSection icon={Network} title={t("Navigation.Connectivity")}>
                            <FormField
                                control={form.control}
                                name="install_host"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("DashboardOriginalHost")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tls"
                                render={({ field }) => (
                                    <FormItem
                                        data-settings-control-row
                                        className="flex items-center space-x-2"
                                    >
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label className="text-sm">{t("ConfigTLS")}</Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dns_servers"
                                render={({ field }) => (
                                    <FormItem data-settings-span="full">
                                        <FormLabel>
                                            {t("CustomPublicDNSNameserversforDDNS") +
                                                " " +
                                                t("SeparateWithComma")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="web_real_ip_header"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("WebRealIPHeader")}</FormLabel>
                                        <FormControl>
                                            <div data-settings-inline-control>
                                                <Input
                                                    disabled={field.value == "NZ::Use-Peer-IP"}
                                                    placeholder="CF-Connecting-IP"
                                                    {...field}
                                                />
                                                <Checkbox
                                                    checked={field.value == "NZ::Use-Peer-IP"}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            form.setValue(
                                                                "web_real_ip_header",
                                                                "NZ::Use-Peer-IP",
                                                            )
                                                        } else {
                                                            form.setValue("web_real_ip_header", "")
                                                        }
                                                    }}
                                                />
                                                <FormLabel className="font-normal">
                                                    {t("UseDirectConnectingIP")}
                                                </FormLabel>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="agent_real_ip_header"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("AgentRealIPHeader")}</FormLabel>
                                        <FormControl>
                                            <div data-settings-inline-control>
                                                <Input
                                                    disabled={field.value == "NZ::Use-Peer-IP"}
                                                    placeholder="CF-Connecting-IP"
                                                    {...field}
                                                />
                                                <Checkbox
                                                    checked={field.value == "NZ::Use-Peer-IP"}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            form.setValue(
                                                                "agent_real_ip_header",
                                                                "NZ::Use-Peer-IP",
                                                            )
                                                        } else {
                                                            form.setValue(
                                                                "agent_real_ip_header",
                                                                "",
                                                            )
                                                        }
                                                    }}
                                                />
                                                <FormLabel className="font-normal">
                                                    {t("UseDirectConnectingIP")}
                                                </FormLabel>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </SettingsSection>
                        <SettingsSection icon={BellRing} title={t("IPChangeNotification")}>
                            <FormField
                                control={form.control}
                                name="cover"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Coverage")}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={`${field.value}`}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(settingCoverageTypes).map(
                                                    ([k, v]) => (
                                                        <SelectItem key={k} value={k}>
                                                            {v}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ignored_ip_notification"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("SpecificServers") + " " + t("SeparateWithComma")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="1,2,3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ip_change_notification_group_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("NotifierGroupID")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0" type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="enable_ip_change_notification"
                                render={({ field }) => (
                                    <FormItem
                                        data-settings-control-row
                                        className="flex items-center space-x-2"
                                    >
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label className="text-sm">{t("Enable")}</Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </SettingsSection>
                        <div data-settings-footer data-settings-span="full">
                            <FormField
                                control={form.control}
                                name="enable_plain_ip_in_notification"
                                render={({ field }) => (
                                    <FormItem
                                        data-settings-span="full"
                                        className="flex items-center space-x-2"
                                    >
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label className="text-sm">
                                                    {t("FullIPNotification")}
                                                </Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                data-settings-span="full"
                                className="justify-self-start"
                            >
                                {t("Confirm")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
