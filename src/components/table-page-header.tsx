import { HeaderButtonGroup } from "@/components/header-button-group"
import { ReactNode } from "react"
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
    return (
        <div data-admin-page-header className="flex items-center justify-between w-full gap-3 mb-4">
            <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
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
