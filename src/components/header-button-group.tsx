import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { IconButton } from "@/components/xui/icon-button"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { KeyedMutator } from "swr"

interface ButtonGroupProps<E, U> {
    className?: string
    children?: React.ReactNode
    delete: { fn: (id: E[]) => Promise<void>; id: E[]; mutate: KeyedMutator<U> }
}

interface ButtonBlockGroupProps<E, U> {
    className?: string
    children?: React.ReactNode
    block: { fn: (id: E[]) => Promise<void>; id: E[]; mutate: KeyedMutator<U> }
}

interface BulkActionGroupProps<E, U> {
    action: { fn: (id: E[]) => Promise<void>; id: E[]; mutate: KeyedMutator<U> }
    children?: React.ReactNode
    className?: string
    confirmTitle: "ConfirmDeletion" | "ConfirmBlock"
    icon: "trash" | "ban"
}

function BulkActionGroup<E, U>({
    action: { fn, id, mutate },
    children,
    className,
    confirmTitle,
    icon,
}: BulkActionGroupProps<E, U>) {
    const { t } = useTranslation()

    const handleAction = async () => {
        try {
            await fn(id)
        } catch (error) {
            toast(t("Error"), {
                description: error instanceof Error ? error.message : String(error),
            })
        }
        await mutate()
    }

    const actionButton = <IconButton variant="destructive" icon={icon} className="text-white" />

    return (
        <div className={className}>
            {id.length < 1 ? (
                <IconButton
                    variant="destructive"
                    icon={icon}
                    className="text-white"
                    onClick={() =>
                        toast(t("Error"), {
                            description: t("Results.NoRowsAreSelected"),
                        })
                    }
                />
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>{actionButton}</AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-lg">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t(confirmTitle)}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("Results.ThisOperationIsUnrecoverable")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
                            <AlertDialogAction
                                className={buttonVariants({
                                    variant: "destructive",
                                    className: "text-white",
                                })}
                                onClick={handleAction}
                            >
                                {t("Confirm")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {children}
        </div>
    )
}

export function HeaderButtonGroup<E, U>({
    className,
    children,
    delete: { fn, id, mutate },
}: ButtonGroupProps<E, U>) {
    return (
        <BulkActionGroup
            action={{ fn, id, mutate }}
            className={className}
            confirmTitle="ConfirmDeletion"
            icon="trash"
        >
            {children}
        </BulkActionGroup>
    )
}

export function HeaderBlockButtonGroup<E, U>({
    className,
    children,
    block: { fn, id, mutate },
}: ButtonBlockGroupProps<E, U>) {
    return (
        <BulkActionGroup
            action={{ fn, id, mutate }}
            className={className}
            confirmTitle="ConfirmBlock"
            icon="ban"
        >
            {children}
        </BulkActionGroup>
    )
}
