import { cn } from "@/lib/utils"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from "react"

const Tabs = forwardRef<
    ComponentRef<typeof TabsPrimitive.Root>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Root ref={ref} data-slot="tabs" className={className} {...props} />
))
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = forwardRef<
    ComponentRef<typeof TabsPrimitive.List>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        data-slot="tabs-list"
        className={cn(
            "flex min-h-10 w-full items-center justify-start gap-2.5 bg-transparent text-muted-foreground",
            className,
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = forwardRef<
    ComponentRef<typeof TabsPrimitive.Trigger>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        data-slot="tabs-trigger"
        className={cn(
            "inline-flex min-h-10 min-w-0 w-auto items-center justify-center truncate whitespace-nowrap px-0 py-1.5 text-xl font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[0.1875rem] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
            className,
        )}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = forwardRef<
    ComponentRef<typeof TabsPrimitive.Content>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        data-slot="tabs-content"
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
