import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { profile, status } = useAuth()

    if (status === "checking") {
        return null
    }

    if (status !== "authenticated" || !profile) {
        return <Navigate to="/dashboard/login" replace />
    }

    return children
}

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { profile, status } = useAuth()

    if (status === "checking") {
        return null
    }

    if (status === "authenticated" && profile) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute
