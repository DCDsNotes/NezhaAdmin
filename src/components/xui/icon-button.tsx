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

export interface IconButtonProps extends ButtonProps {
    icon:
        | "clipboard"
        | "check"
        | "edit"
        | "trash"
        | "plus"
        | "terminal"
        | "update"
        | "folder-closed"
        | "play"
        | "download"
        | "upload"
        | "menu"
        | "ban"
        | "expand"
        | "cog"
        | "minus"
        | "user-pen"
        | "more"
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
    const { className, icon, ...rest } = props

    return (
        <Button className={cn("rounded-xl", className)} {...rest} ref={ref} size="icon">
            {(() => {
                switch (icon) {
                    case "clipboard": {
                        return <Clipboard />
                    }
                    case "check": {
                        return <Check />
                    }
                    case "edit": {
                        return <Edit2 />
                    }
                    case "trash": {
                        return <Trash2 />
                    }
                    case "plus": {
                        return <Plus />
                    }
                    case "terminal": {
                        return <Terminal />
                    }
                    case "update": {
                        return <CircleArrowUp />
                    }
                    case "folder-closed": {
                        return <FolderClosed />
                    }
                    case "play": {
                        return <Play />
                    }
                    case "download": {
                        return <Download />
                    }
                    case "upload": {
                        return <Upload />
                    }
                    case "menu": {
                        return <Menu />
                    }
                    case "ban": {
                        return <BanIcon />
                    }
                    case "expand": {
                        return <Expand />
                    }
                    case "cog": {
                        return <CogIcon />
                    }
                    case "minus": {
                        return <Minus />
                    }
                    case "user-pen": {
                        return <UserPen />
                    }
                    case "more": {
                        return <MoreHorizontal />
                    }
                }
            })()}
        </Button>
    )
})