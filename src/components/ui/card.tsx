import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-border/70 bg-card text-card-foreground shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl",
                className,
            )}
            {...props}
        />
    ),
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)} {...props} />
    ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-xl font-semibold leading-none tracking-tight sm:text-2xl", className)}
            {...props}
        />
    ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
    ),
)
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />
    ),
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex items-center p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />
    ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }