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
        <div className="flex items-center justify-between w-full gap-3 mt-6 mb-4">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <HeaderButtonGroup
                className="ml-auto flex items-center justify-end gap-2 flex-nowrap shrink-0"
                delete={deleteAction}
            >
                {children}
            </HeaderButtonGroup>
        </div>
    )
}
