import { HeaderButtonGroup } from "@/components/header-button-group"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { KeyedMutator } from "swr"

interface TablePageHeaderProps<E, U> {
    title: ReactNode
    children?: ReactNode
    deleteAction: {
        fn: (id: E[]) => Promise<void>
        id: E[]
        mutate: KeyedMutator<U>
    }
}

export function TablePageHeader<E, U>({
    title,
    children,
    deleteAction,
}: TablePageHeaderProps<E, U>) {
    const { t } = useTranslation()
    return (
        <div className="flex items-end justify-between w-full gap-3 mt-6 mb-4">
            <div className="min-w-0">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/60">
                    {t("Navigation.ControlCenter")}
                </p>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <HeaderButtonGroup
                className="ml-auto flex items-center justify-end gap-2 flex-nowrap shrink-0"
                delete={deleteAction}
            >
                {children}
            </HeaderButtonGroup>
        </div>
    )
}
