import { HeaderButtonGroup } from "@/components/header-button-group"
import { ReactNode } from "react"
import { KeyedMutator } from "swr"

interface TablePageToolbarProps<E, U> {
    leading: ReactNode
    children?: ReactNode
    deleteAction: {
        fn: (id: E[]) => Promise<void>
        id: E[]
        mutate: KeyedMutator<U>
    }
}

export function TablePageToolbar<E, U>({
    leading,
    children,
    deleteAction,
}: TablePageToolbarProps<E, U>) {
    return (
        <div data-admin-page-header className="flex items-center justify-between w-full gap-3 mb-4">
            <div data-admin-page-leading className="min-w-0 flex-1">
                {leading}
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

interface TablePageHeaderProps<E, U> extends Omit<TablePageToolbarProps<E, U>, "leading"> {
    title: ReactNode
}

export function TablePageHeader<E, U>({
    title,
    children,
    deleteAction,
}: TablePageHeaderProps<E, U>) {
    return (
        <TablePageToolbar
            leading={<h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
            deleteAction={deleteAction}
        >
            {children}
        </TablePageToolbar>
    )
}
