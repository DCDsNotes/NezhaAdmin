import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    BanIcon,
    Check,
    CircleArrowUp,
    Clipboard,
    CogIcon,
    Download,
    Edit2,
    Expand,
    FolderClosed,
    type LucideIcon,
    Menu,
    Minus,
    MoreHorizontal,
    Play,
    Plus,
    Terminal,
    Trash2,
    Upload,
    UserPen,
} from "lucide-react"
import { forwardRef } from "react"

const icons = {
    ban: BanIcon,
    check: Check,
    clipboard: Clipboard,
    cog: CogIcon,
    download: Download,
    edit: Edit2,
    expand: Expand,
    "folder-closed": FolderClosed,
    menu: Menu,
    minus: Minus,
    more: MoreHorizontal,
    play: Play,
    plus: Plus,
    terminal: Terminal,
    trash: Trash2,
    update: CircleArrowUp,
    upload: Upload,
    "user-pen": UserPen,
} satisfies Record<string, LucideIcon>

export interface IconButtonProps extends ButtonProps {
    icon: keyof typeof icons
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, icon, ...props }, ref) => {
        const Icon = icons[icon]
        return (
            <Button className={cn("rounded-md", className)} {...props} ref={ref} size="icon">
                <Icon />
            </Button>
        )
    },
)

IconButton.displayName = "IconButton"
