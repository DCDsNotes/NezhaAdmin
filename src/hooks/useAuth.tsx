import { AUTH_EXPIRED_EVENT } from "@/api/api"
import { getProfile, login as loginRequest } from "@/api/user"
import { AuthContextProps, AuthStatus, ModelProfile } from "@/types"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useMainStore } from "./useMainStore"

const AuthContext = createContext<AuthContextProps>({
    profile: undefined,
    status: "checking",
    login: () => {},
    loginOauth2: () => {},
    logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const profile = useMainStore((store) => store.profile)
    const setProfile = useMainStore((store) => store.setProfile)
    const [status, setStatus] = useState<AuthStatus>("checking")
    const validationVersion = useRef(0)
    const { t } = useTranslation()
    const navigate = useNavigate()

    const setAuthenticatedProfile = useCallback(
        (user: ModelProfile) => {
            const safeUser = {
                ...user,
                role: user.role === 0 ? 0 : 1,
            }
            setProfile(safeUser)
            setStatus("authenticated")
        },
        [setProfile],
    )

    const clearAuthentication = useCallback(() => {
        setProfile(undefined)
        setStatus("guest")
    }, [setProfile])

    useEffect(() => {
        const handleAuthExpired = () => {
            validationVersion.current += 1
            clearAuthentication()
            if (window.location.pathname !== "/dashboard/login") {
                navigate("/dashboard/login", { replace: true })
            }
        }

        window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    }, [clearAuthentication, navigate])

    useEffect(() => {
        const version = ++validationVersion.current
        let active = true

        ;(async () => {
            try {
                const user = await getProfile()
                if (active && validationVersion.current === version) {
                    setAuthenticatedProfile(user)
                }
            } catch {
                if (active && validationVersion.current === version) {
                    clearAuthentication()
                }
            }
        })()

        return () => {
            active = false
            if (validationVersion.current === version) {
                validationVersion.current += 1
            }
        }
    }, [clearAuthentication, setAuthenticatedProfile])

    const login = useCallback(
        async (username: string, password: string) => {
            const version = ++validationVersion.current
            try {
                await loginRequest(username, password)
                const user = await getProfile()
                if (validationVersion.current !== version) return
                setAuthenticatedProfile(user)
                navigate("/dashboard", { replace: true })
            } catch (error: any) {
                if (validationVersion.current !== version) return
                clearAuthentication()
                const msg = error?.message
                if (msg === "ApiErrorUnauthorized" || msg === "Unauthorized") {
                    toast(t("InvalidUsernameOrPassword"))
                } else {
                    toast(msg || t("NetworkError"))
                }
            }
        },
        [clearAuthentication, navigate, setAuthenticatedProfile, t],
    )

    const loginOauth2 = useCallback(async () => {
        const version = ++validationVersion.current
        try {
            const user = await getProfile()
            if (validationVersion.current !== version) return
            setAuthenticatedProfile(user)
            navigate("/dashboard", { replace: true })
        } catch (error: any) {
            if (validationVersion.current !== version) return
            clearAuthentication()
            toast(error.message)
        } finally {
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [clearAuthentication, navigate, setAuthenticatedProfile])

    const logout = useCallback(() => {
        validationVersion.current += 1
        ;["nz-jwt", "nz-csrf"].forEach((name) => {
            document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
        })
        clearAuthentication()
        navigate("/dashboard/login", { replace: true })
    }, [clearAuthentication, navigate])

    const value = useMemo(
        () => ({
            profile,
            status,
            login,
            loginOauth2,
            logout,
        }),
        [login, loginOauth2, logout, profile, status],
    )
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext)
}
