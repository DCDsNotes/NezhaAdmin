import { createRoot } from "react-dom/client"
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"

import { TerminalPage } from "./components/terminal"
import ErrorPage from "./error-page"
import { AuthProvider } from "./hooks/useAuth"
import { NotificationProvider } from "./hooks/useNotfication"
import { ServerProvider } from "./hooks/useServer"
import "./index.css"
import "./lib/i18n"
import AlertRulePage from "./routes/alert-rule"
import CronPage from "./routes/cron"
import DDNSPage from "./routes/ddns"
import LoginPage from "./routes/login"
import NATPage from "./routes/nat"
import NotificationPage from "./routes/notification"
import NotificationGroupPage from "./routes/notification-group"
import OnlineUserPage from "./routes/online-user"
import ProfilePage from "./routes/profile"
import ProtectedRoute, { GuestRoute } from "./routes/protect"
import Root from "./routes/root"
import ServerPage from "./routes/server"
import ServerGroupPage from "./routes/server-group"
import ServicePage from "./routes/service"
import SettingsPage from "./routes/settings"
import UserPage from "./routes/user"
import WAFPage from "./routes/waf"

const router = createBrowserRouter([
    {
        path: "/dashboard",
        element: (
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: "login",
                element: (
                    <GuestRoute>
                        <Root forceGuest />
                    </GuestRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <LoginPage />,
                    },
                ],
            },
            {
                element: (
                    <ProtectedRoute>
                        <Root />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: (
                            <ServerProvider withServerGroup>
                                <ServerPage />
                            </ServerProvider>
                        ),
                    },
                    {
                        path: "service",
                        element: (
                            <ServerProvider withServer>
                                <NotificationProvider withNotifierGroup>
                                    <ServicePage />
                                </NotificationProvider>
                            </ServerProvider>
                        ),
                    },
                    {
                        path: "cron",
                        element: (
                            <ServerProvider withServer>
                                <NotificationProvider withNotifierGroup>
                                    <CronPage />
                                </NotificationProvider>
                            </ServerProvider>
                        ),
                    },
                    {
                        path: "alert-rule",
                        element: (
                            <NotificationProvider withNotifierGroup>
                                <AlertRulePage />
                            </NotificationProvider>
                        ),
                    },
                    {
                        path: "ddns",
                        element: <DDNSPage />,
                    },
                    {
                        path: "nat",
                        element: <NATPage />,
                    },
                    {
                        path: "server-group",
                        element: (
                            <ServerProvider withServer>
                                <ServerGroupPage />
                            </ServerProvider>
                        ),
                    },
                    {
                        path: "notification-group",
                        element: (
                            <NotificationProvider withNotifier>
                                <NotificationGroupPage />
                            </NotificationProvider>
                        ),
                    },
                    {
                        path: "terminal/:id",
                        element: <TerminalPage />,
                    },
                    {
                        path: "notification",
                        element: (
                            <NotificationProvider withNotifierGroup>
                                <NotificationPage />
                            </NotificationProvider>
                        ),
                    },
                    {
                        path: "profile",
                        element: (
                            <ServerProvider withServer withServerGroup>
                                <ProfilePage />
                            </ServerProvider>
                        ),
                    },
                    {
                        path: "settings",
                        element: <SettingsPage />,
                    },
                    {
                        path: "settings/user",
                        element: <UserPage />,
                    },
                    {
                        path: "settings/waf",
                        element: <WAFPage />,
                    },
                    {
                        path: "settings/online-user",
                        element: <OnlineUserPage />,
                    },
                ],
            },
        ],
    },
])

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />)
