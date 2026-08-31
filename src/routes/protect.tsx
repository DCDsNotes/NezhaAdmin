import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { profile } = useAuth()

    if (!profile) {
        return <Navigate to="/dashboard/login" replace />
    }

    return children
}

export default ProtectedRoute
