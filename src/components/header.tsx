import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminNavigation } from "@/hooks/useAdminNavigation"
import { useAuth } from "@/hooks/useAuth"
import { useMainStore } from "@/hooks/useMainStore"
import { ExternalLink, Home, LogOut, RefreshCcw, Settings, User2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"

type HeaderProps = {
    siteName: string
    forceGuest?: boolean
}

export default function Header({ siteName, forceGuest = false }: HeaderProps) {
    const { t } = useTranslation()
    const { logout } = useAuth()
    const profile = useMainStore((store) => store.profile)
    const navigate = useNavigate()
    const [profileOpen, setProfileOpen] = useState(false)
    const { current } = useAdminNavigation()
    const guest = forceGuest || !profile

    return (
        <header className="admin-topbar">
            <div className="admin-topbar__inner">
                <Link to={guest ? "/dashboard/login" : "/dashboard"} className="admin-brand">
                    <img src="/dashboard/logo.png" alt="" />
                    <strong>{siteName}</strong>
                </Link>
                <span className="admin-topbar__section">
                    {guest ? t("Login") : current?.label || t("Navigation.ControlCenter")}
                </span>
                <div className="admin-topbar__actions">
                    {!guest && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={t("Refresh")}
                            aria-label={t("Refresh")}
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCcw />
                        </Button>
                    )}
                    <Button variant="ghost" size={guest ? "icon" : "sm"} asChild>
                        <a href="/" aria-label={t("BackToHome")}>
                            {guest ? <Home /> : <ExternalLink />}
                            {!guest && <span>{t("BackToHome")}</span>}
                        </a>
                    </Button>
                    <ModeToggle />
                    {!guest && profile && (
                        <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                            <DropdownMenuTrigger asChild>
                                <button type="button" className="admin-profile-trigger">
                                    <Avatar>
                                        <AvatarFallback>
                                            {profile.username.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{profile.username}</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="break-all">
                                    {profile.username}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setProfileOpen(false)
                                            navigate("/dashboard/profile")
                                        }}
                                    >
                                        <User2 />
                                        {t("Profile")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setProfileOpen(false)
                                            navigate("/dashboard/settings")
                                        }}
                                    >
                                        <Settings />
                                        {t("Settings")}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut />
                                    {t("Logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}
