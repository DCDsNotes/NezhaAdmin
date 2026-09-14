import { cn } from "@/lib/utils"
import { ComponentProps, forwardRef } from "react"

const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "min-h-[5rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[0.1875rem] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
                    className,
                )}
                ref={ref}
                {...props}
            />
        )
    },
)
Textarea.displayName = "Textarea"

export { Textarea }
