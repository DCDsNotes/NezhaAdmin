import { swrFetcher } from "@/api/api"
import { deleteUser } from "@/api/user"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { createSelectionColumn } from "@/components/selection-column"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { SettingsTab } from "@/components/settings-tab"
import { UserCard } from "@/components/user"
import { ModelUser } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function UserPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelUser[]>("/api/v1/user", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.UnExpectedError", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<ModelUser>[] = [
        createSelectionColumn<ModelUser>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.id,
        },
        {
            header: t("Username"),
            accessorKey: "username",
            accessorFn: (row) => row.username,
        },
        {
            header: t("Role"),
            accessorKey: "role",
            accessorFn: (row) => {
                return row.role === 1 ? t("User") : t("Admin")
            },
        },
        {
            header: t("LastLogin"),
            accessorKey: "updated_at",
            accessorFn: (row) =>
                row.updated_at ? new Date(row.updated_at).toLocaleString() : t("Never"),
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{
                            fn: deleteUser,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <></>
                    </ActionButtonGroup>
                )
            },
        },
    ]

    const dataCache = useMemo(() => {
        return data ?? []
    }, [data])

    const table = useReactTable({
        data: dataCache,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const selectedRows = table.getSelectedRowModel().rows

    return (
        <div className="px-3">
            <SettingsTab className="mt-6 w-full" />
            <div className="flex mt-4 mb-4">
                <HeaderButtonGroup
                    className="flex-2 flex gap-2 ml-auto"
                    delete={{
                        fn: deleteUser,
                        id: selectedRows.map((r) => r.original.id),
                        mutate: mutate,
                    }}
                >
                    <UserCard mutate={mutate} />
                </HeaderButtonGroup>
            </div>

            <DataTable table={table} isLoading={isLoading} />
        </div>
    )
}
