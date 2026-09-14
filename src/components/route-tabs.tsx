import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"

export interface RouteTabItem {
    label: ReactNode
    to: string
}

interface RouteTabsProps {
    className?: string
    items: RouteTabItem[]
}

export function RouteTabs({ className, items }: RouteTabsProps) {
    const { pathname } = useLocation()

    return (
        <Tabs value={pathname} className={cn("admin-route-tabs min-w-0", className)}>
            <TabsList
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
                {items.map((item) => (
                    <TabsTrigger key={item.to} value={item.to} asChild>
                        <Link to={item.to}>{item.label}</Link>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
