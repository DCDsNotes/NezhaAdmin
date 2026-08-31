import { ModelProfile } from "@/types"

export type AuthStatus = "checking" | "guest" | "authenticated"

export interface AuthContextProps {
    profile: ModelProfile | undefined
    status: AuthStatus
    login: (username: string, password: string) => void
    loginOauth2: () => void
    logout: () => void
}
